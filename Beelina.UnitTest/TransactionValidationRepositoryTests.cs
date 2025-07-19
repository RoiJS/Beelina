using Beelina.LIB.BusinessLogic;
using Beelina.LIB.DbContexts;
using Beelina.LIB.Dtos;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Beelina.UnitTest
{
    public class TransactionValidationRepositoryTests : BeelinaBaseTest, IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly BeelinaClientDataContext _context;
        private readonly TransactionRepository _repository;
        private readonly Mock<IProductRepository<Product>> _productRepositoryMock;
        private readonly ILogger<TransactionRepository> _logger;

        public TransactionValidationRepositoryTests()
        {
            // Setup SQLite in-memory database
            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            var options = new DbContextOptionsBuilder<BeelinaClientDataContext>()
                .UseSqlite(_connection)
                .Options;

            _context = new BeelinaClientDataContext(options, new DataContextHelper());
            _context.Database.EnsureCreated();

            // Seed test data
            SeedSampleData(_context, 1);
            SeedValidationTestData(_context);

            // Setup logger
            _logger = new LoggerFactory().CreateLogger<TransactionRepository>();

            // Setup mocks
            _productRepositoryMock = new Mock<IProductRepository<Product>>();

            // Setup repositories with real context
            var beelinaDataContext = new BeelinaDataContext(new DbContextOptions<BeelinaDataContext>(), new DataContextHelper());
            var beelinaRepository = new BeelinaRepository<Transaction>(beelinaDataContext, _context);
            var userAccountRepository = new Mock<IUserAccountRepository<UserAccount>>();
            var productTransactionRepository = new Mock<IProductTransactionRepository<ProductTransaction>>();
            var emailServerSettings = Options.Create(new EmailServerSettings());
            var appHostInfo = Options.Create(new AppHostInfo());
            var appSettings = Options.Create(new ApplicationSettings());
            var currentUserService = new TestCurrentUserService { CurrentUserId = 1 };
            var userSettingRepository = new Mock<IUserSettingsRepository<UserSetting>>();
            var generalSettingsRepository = new Mock<IGeneralSettingRepository<GeneralSetting>>();
            var paymentRepository = new Mock<IPaymentRepository<Payment>>();
            var logger = new Mock<ILogger<TransactionRepository>>();

            _repository = new TransactionRepository(
                beelinaRepository,
                userAccountRepository.Object,
                productTransactionRepository.Object,
                emailServerSettings,
                appHostInfo,
                appSettings,
                currentUserService,
                userSettingRepository.Object,
                generalSettingsRepository.Object,
                paymentRepository.Object,
                logger.Object
            );
            _repository.SetCurrentUserId(1);
        }

        private void SeedValidationTestData(BeelinaClientDataContext context)
        {
            // Add GeneralSettings for business model
            var generalSetting = new GeneralSetting 
            { 
                Id = 1,
                BusinessModel = BusinessModelEnum.WarehousePanelMonitoring 
            };
            context.GeneralSettings.Add(generalSetting);

            // Add test products with limited stock
            var lowStockProduct = new Product
            {
                Id = 300,
                Name = "Low Stock Product",
                Code = "LSP001",
                IsActive = true,
                IsDelete = false,
                IsTransferable = false,
                NumberOfUnits = 1,
                ProductUnitId = 1,
                SupplierId = 1
            };

            var sufficientStockProduct = new Product
            {
                Id = 301,
                Name = "Sufficient Stock Product",
                Code = "SSP001", 
                IsActive = true,
                IsDelete = false,
                IsTransferable = false,
                NumberOfUnits = 1,
                ProductUnitId = 1,
                SupplierId = 1
            };

            context.Products.AddRange(lowStockProduct, sufficientStockProduct);

            // Add test transactions with product transactions
            var transaction1 = new Transaction
            {
                Id = 400,
                InvoiceNo = "TXN-001",
                TransactionDate = DateTime.Now.AddDays(-1),
                StoreId = 1,
                Status = TransactionStatusEnum.Draft,
                CreatedById = 1,
                IsActive = true,
                IsDelete = false,
                ProductTransactions = new List<ProductTransaction>
                {
                    new ProductTransaction
                    {
                        Id = 500,
                        ProductId = 300, // Low stock product
                        TransactionId = 400,
                        Quantity = 15, // Requesting 15 units
                        Price = 10.0,
                        IsActive = true,
                        IsDelete = false
                    },
                    new ProductTransaction
                    {
                        Id = 501,
                        ProductId = 301, // Sufficient stock product
                        TransactionId = 400,
                        Quantity = 5, // Requesting 5 units
                        Price = 20.0,
                        IsActive = true,
                        IsDelete = false
                    }
                }
            };

            var transaction2 = new Transaction
            {
                Id = 401,
                InvoiceNo = "TXN-002",
                TransactionDate = DateTime.Now.AddDays(-1),
                StoreId = 1,
                Status = TransactionStatusEnum.Draft,
                CreatedById = 1,
                IsActive = true,
                IsDelete = false,
                ProductTransactions = new List<ProductTransaction>
                {
                    new ProductTransaction
                    {
                        Id = 502,
                        ProductId = 300, // Low stock product
                        TransactionId = 401,
                        Quantity = 8, // Requesting 8 more units (total: 15 + 8 = 23)
                        Price = 10.0,
                        IsActive = true,
                        IsDelete = false
                    }
                }
            };

            context.Transactions.AddRange(transaction1, transaction2);
            context.SaveChanges();
        }

        [Fact]
        public async Task ValidateProductTransactionsQuantities_WithSufficientStock_ShouldReturnEmptyList()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;
            var userAccountId = 1;

            var transactionInputs = new List<TransactionInput>
            {
                new TransactionInput
                {
                    Id = 400,
                    InvoiceNo = "TXN-001",
                    ProductTransactionInputs = new List<ProductTransactionInput>
                    {
                        new ProductTransactionInput
                        {
                            Id = 501,
                            ProductId = 301, // Sufficient stock product
                            Quantity = 5 // Only requesting 5 units
                        }
                    }
                }
            };

            // Setup mock to return products with sufficient stock
            var mockProducts = new List<Product>
            {
                new Product
                {
                    Id = 301,
                    Code = "SSP001",
                    Name = "Sufficient Stock Product",
                    StockQuantity = 100 // Has 100 units available
                }
            };

            _productRepositoryMock
                .Setup(x => x.GetProducts(userAccountId, 0, "", null, cancellationToken))
                .ReturnsAsync(mockProducts);

            // Act
            var result = await _repository.ValidateProductTransactionsQuantities(
                transactionInputs,
                userAccountId,
                _productRepositoryMock.Object,
                cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result); // Should be empty since there are no stock issues
        }

        [Fact]
        public async Task ValidateProductTransactionsQuantities_WithInsufficientStock_ShouldReturnInvalidTransactions()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;
            var userAccountId = 1;

            var transactionInputs = new List<TransactionInput>
            {
                new TransactionInput
                {
                    Id = 400,
                    InvoiceNo = "TXN-001",
                    ProductTransactionInputs = new List<ProductTransactionInput>
                    {
                        new ProductTransactionInput
                        {
                            Id = 500,
                            ProductId = 300, // Low stock product
                            Quantity = 15 // Requesting 15 units
                        }
                    }
                }
            };

            // Setup mock to return products with insufficient stock
            var mockProducts = new List<Product>
            {
                new Product
                {
                    Id = 300,
                    Code = "LSP001",
                    Name = "Low Stock Product",
                    StockQuantity = 10 // Only has 10 units available, but requesting 15
                }
            };

            _productRepositoryMock
                .Setup(x => x.GetProducts(userAccountId, 0, "", null, cancellationToken))
                .ReturnsAsync(mockProducts);

            // Act
            var result = await _repository.ValidateProductTransactionsQuantities(
                transactionInputs,
                userAccountId,
                _productRepositoryMock.Object,
                cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result); // Should have one invalid transaction

            var invalidTransaction = result[0];
            Assert.Equal(400, invalidTransaction.TransactionId);
            Assert.Equal("TXN-001", invalidTransaction.TransactionCode);
            Assert.Single(invalidTransaction.InvalidProductTransactionOverallQuantities);

            var invalidProduct = invalidTransaction.InvalidProductTransactionOverallQuantities[0];
            Assert.Equal(300, invalidProduct.ProductId);
            Assert.Equal("LSP001", invalidProduct.ProductCode);
            Assert.Equal("Low Stock Product", invalidProduct.ProductName);
            Assert.Equal(10, invalidProduct.CurrentQuantity);
            Assert.Equal(15, invalidProduct.OverallQuantity);
        }

        [Fact]
        public async Task ValidateProductTransactionsQuantities_WithMultipleTransactions_ShouldCalculateOverallQuantities()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;
            var userAccountId = 1;

            var transactionInputs = new List<TransactionInput>
            {
                new TransactionInput
                {
                    Id = 400,
                    InvoiceNo = "TXN-001",
                    ProductTransactionInputs = new List<ProductTransactionInput>
                    {
                        new ProductTransactionInput
                        {
                            Id = 500,
                            ProductId = 300, // Low stock product
                            Quantity = 10 // Requesting 10 units
                        }
                    }
                },
                new TransactionInput
                {
                    Id = 401,
                    InvoiceNo = "TXN-002",
                    ProductTransactionInputs = new List<ProductTransactionInput>
                    {
                        new ProductTransactionInput
                        {
                            Id = 502,
                            ProductId = 300, // Same product
                            Quantity = 8 // Requesting 8 more units (total: 18)
                        }
                    }
                }
            };

            // Setup mock to return products with insufficient stock for combined quantities
            var mockProducts = new List<Product>
            {
                new Product
                {
                    Id = 300,
                    Code = "LSP001",
                    Name = "Low Stock Product",
                    StockQuantity = 15 // Only has 15 units available, but requesting 10 + 8 = 18 total
                }
            };

            _productRepositoryMock
                .Setup(x => x.GetProducts(userAccountId, 0, "", null, cancellationToken))
                .ReturnsAsync(mockProducts);

            // Act
            var result = await _repository.ValidateProductTransactionsQuantities(
                transactionInputs,
                userAccountId,
                _productRepositoryMock.Object,
                cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count); // Both transactions should be flagged as invalid

            // Verify both transactions are reported as invalid
            var transaction1 = result.FirstOrDefault(r => r.TransactionId == 400);
            var transaction2 = result.FirstOrDefault(r => r.TransactionId == 401);

            Assert.NotNull(transaction1);
            Assert.NotNull(transaction2);
            Assert.Equal("TXN-001", transaction1.TransactionCode);
            Assert.Equal("TXN-002", transaction2.TransactionCode);

            // Both should report the same invalid product with overall quantity of 18
            Assert.Single(transaction1.InvalidProductTransactionOverallQuantities);
            Assert.Single(transaction2.InvalidProductTransactionOverallQuantities);

            var invalidProduct1 = transaction1.InvalidProductTransactionOverallQuantities[0];
            var invalidProduct2 = transaction2.InvalidProductTransactionOverallQuantities[0];

            Assert.Equal(300, invalidProduct1.ProductId);
            Assert.Equal(300, invalidProduct2.ProductId);
            Assert.Equal(15, invalidProduct1.CurrentQuantity);
            Assert.Equal(15, invalidProduct2.CurrentQuantity);
            Assert.Equal(18, invalidProduct1.OverallQuantity); // Combined quantity
            Assert.Equal(18, invalidProduct2.OverallQuantity); // Combined quantity
        }

        [Fact]
        public async Task ValidateMultipleTransactionsProductQuantities_ShouldCallValidateProductTransactionsQuantities()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;
            var userAccountId = 1;
            var transactionIds = new List<int> { 400, 401 };

            // Setup mock to return products with insufficient stock
            var mockProducts = new List<Product>
            {
                new Product
                {
                    Id = 300,
                    Code = "LSP001",
                    Name = "Low Stock Product",
                    StockQuantity = 10 // Limited stock
                }
            };

            _productRepositoryMock
                .Setup(x => x.GetProducts(userAccountId, 0, "", null, cancellationToken))
                .ReturnsAsync(mockProducts);

            // Act
            var result = await _repository.ValidateMultipleTransactionsProductQuantities(
                transactionIds,
                userAccountId,
                _productRepositoryMock.Object,
                cancellationToken);

            // Assert
            Assert.NotNull(result);
            // Verify that the method called the underlying validation logic
            _productRepositoryMock.Verify(x => x.GetProducts(userAccountId, 0, "", null, cancellationToken), Times.Once);
        }

        [Fact]
        public async Task ValidateProductTransactionsQuantities_WithCancelledToken_ShouldThrowOperationCanceledException()
        {
            // Arrange
            var cancellationTokenSource = new CancellationTokenSource();
            cancellationTokenSource.Cancel();
            var cancelledToken = cancellationTokenSource.Token;
            var userAccountId = 1;

            var transactionInputs = new List<TransactionInput>
            {
                new TransactionInput
                {
                    Id = 400,
                    InvoiceNo = "TXN-001",
                    ProductTransactionInputs = new List<ProductTransactionInput>
                    {
                        new ProductTransactionInput
                        {
                            Id = 500,
                            ProductId = 300,
                            Quantity = 15
                        }
                    }
                }
            };

            // Act & Assert
            var exception = await Assert.ThrowsAnyAsync<OperationCanceledException>(async () =>
            {
                await _repository.ValidateProductTransactionsQuantities(
                    transactionInputs,
                    userAccountId,
                    _productRepositoryMock.Object,
                    cancelledToken);
            });

            Assert.True(exception.CancellationToken.IsCancellationRequested);
        }

        public void Dispose()
        {
            _connection?.Dispose();
            _context?.Dispose();
        }
    }
}
