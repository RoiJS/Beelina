using Beelina.LIB.BusinessLogic;
using Beelina.LIB.DbContexts;
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
    public class TransactionRepositoryRegisterTests : BeelinaBaseTest, IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly BeelinaClientDataContext _context;
        private readonly TransactionRepository _repository;
        private readonly ProductTransactionRepository _productTransactionRepository;
        private readonly Mock<IUserAccountRepository<UserAccount>> _userAccountRepositoryMock;
        private readonly Mock<IPaymentRepository<Payment>> _paymentRepositoryMock;
        private readonly Mock<IUserSettingsRepository<UserSetting>> _userSettingRepositoryMock;
        private readonly Mock<IGeneralSettingRepository<GeneralSetting>> _generalSettingsRepositoryMock;
        private readonly Mock<ICurrentUserService> _currentUserServiceMock;
        private readonly ILogger<TransactionRepository> _logger;

        public TransactionRepositoryRegisterTests()
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
            SeedSampleData(_context, FieldAgent.Id);
            SeedTransactionTestData(_context);

            // Setup logger
            _logger = new LoggerFactory().CreateLogger<TransactionRepository>();

            // Setup mocks
            _userAccountRepositoryMock = new Mock<IUserAccountRepository<UserAccount>>();
            _paymentRepositoryMock = new Mock<IPaymentRepository<Payment>>();
            _userSettingRepositoryMock = new Mock<IUserSettingsRepository<UserSetting>>();
            _generalSettingsRepositoryMock = new Mock<IGeneralSettingRepository<GeneralSetting>>();
            _currentUserServiceMock = new Mock<ICurrentUserService>();

            // Setup repositories with real context
            var beelinaDataContext = new BeelinaDataContext(new DbContextOptions<BeelinaDataContext>(), new DataContextHelper());
            var beelinaRepository = new BeelinaRepository<Transaction>(beelinaDataContext, _context);
            var beelinaProductTransactionRepository = new BeelinaRepository<ProductTransaction>(beelinaDataContext, _context);
            var emailServerSettings = Options.Create(new EmailServerSettings());
            var appHostInfo = Options.Create(new AppHostInfo());
            var appSettings = Options.Create(new ApplicationSettings());

            // Create real ProductTransactionRepository
            _productTransactionRepository = new ProductTransactionRepository(
                beelinaProductTransactionRepository,
                _currentUserServiceMock.Object,
                _userAccountRepositoryMock.Object);
            _productTransactionRepository.SetCurrentUserId(FieldAgent.Id);
            var loggerMock = new Mock<ILogger<TransactionRepository>>();

            _repository = new TransactionRepository(
                beelinaRepository,
                _userAccountRepositoryMock.Object,
                _productTransactionRepository,
                emailServerSettings,
                appHostInfo,
                appSettings,
                _currentUserServiceMock.Object,
                _userSettingRepositoryMock.Object,
                _generalSettingsRepositoryMock.Object,
                _paymentRepositoryMock.Object,
                loggerMock.Object
            );
            _repository.SetCurrentUserId(FieldAgent.Id);
        }

        private void SeedTransactionTestData(BeelinaClientDataContext context)
        {
            // Add GeneralSettings for business model
            var generalSetting = new GeneralSetting
            {
                Id = 1,
                BusinessModel = BusinessModelEnum.WarehousePanelMonitoring
            };
            context.GeneralSettings.Add(generalSetting);
            context.SaveChanges();

            // Add existing transaction with product transactions
            var existingTransaction = new Transaction
            {
                Id = 100,
                InvoiceNo = "INV-EXISTING-001",
                TransactionDate = DateTime.Now.AddDays(-1),
                StoreId = 1,
                Status = TransactionStatusEnum.Confirmed,
                ModeOfPayment = (int)ModeOfPaymentEnum.Cash,
                Discount = 0,
                IsActive = true,
                IsDelete = false,
                ProductTransactions = new List<ProductTransaction>
                {
                    new ProductTransaction
                    {
                        Id = 200,
                        TransactionId = 100,
                        ProductId = 1,
                        Quantity = 5,
                        Price = 25.0,
                        Status = PaymentStatusEnum.Paid,
                        IsActive = true,
                        IsDelete = false,
                        ProductTransactionQuantityHistory = new List<ProductTransactionQuantityHistory>()
                    },
                    new ProductTransaction
                    {
                        Id = 201,
                        TransactionId = 100,
                        ProductId = 2,
                        Quantity = 3,
                        Price = 30.0,
                        Status = PaymentStatusEnum.Paid,
                        IsActive = true,
                        IsDelete = false,
                        ProductTransactionQuantityHistory = new List<ProductTransactionQuantityHistory>()
                    }
                }
            };

            context.Transactions.Add(existingTransaction);
            context.SaveChanges();

            // Add ProductTransactionQuantityHistory entries separately
            var quantityHistories = new List<ProductTransactionQuantityHistory>
            {
                new ProductTransactionQuantityHistory
                {
                    Id = 300,
                    ProductTransactionId = 200,
                    Quantity = 5,
                    DateCreated = DateTime.Now.AddDays(-1),
                    IsActive = true,
                    IsDelete = false
                },
                new ProductTransactionQuantityHistory
                {
                    Id = 301,
                    ProductTransactionId = 201,
                    Quantity = 3,
                    DateCreated = DateTime.Now.AddDays(-1),
                    IsActive = true,
                    IsDelete = false
                }
            };

            context.ProductTransactionQuantityHistory.AddRange(quantityHistories);
            context.SaveChanges();
        }

        [Fact]
        public async Task RegisterTransactionWithBusinessLogic_WithNewTransaction_ShouldCreateNewTransaction()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;

            var transactionInput = new TransactionInput
            {
                Id = 0, // New transaction
                InvoiceNo = "INV-TEST-001",
                TransactionDate = DateTime.Now.ToString("yyyy-MM-dd"),
                Status = TransactionStatusEnum.Draft,
                ModeOfPayment = (int)ModeOfPaymentEnum.Cash,
                Discount = 5.0,
                StoreId = 1,
                Paid = false,
                ProductTransactionInputs = new List<ProductTransactionInput>
                {
                    new ProductTransactionInput
                    {
                        Id = 0,
                        ProductId = 1, // From base test data
                        Price = 10.50,
                        Quantity = 5,
                        CurrentQuantity = 5
                    }
                }
            };

            // Act
            var result = await _repository.RegisterTransactionWithBusinessLogic(transactionInput, cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("INV-TEST-001", result.InvoiceNo);
            Assert.Equal(TransactionStatusEnum.Draft, result.Status);
            Assert.Equal((int)ModeOfPaymentEnum.Cash, result.ModeOfPayment);
            Assert.Equal(5.0, result.Discount);
            Assert.Equal(1, result.StoreId);
            Assert.Single(result.ProductTransactions);

            var productTransaction = result.ProductTransactions[0];
            Assert.Equal(1, productTransaction.ProductId);
            Assert.Equal(10.50, productTransaction.Price);
            Assert.Equal(5, productTransaction.Quantity);
            Assert.Equal(PaymentStatusEnum.Unpaid, productTransaction.Status);

            // Verify the transaction was actually saved to database
            var savedTransaction = await _context.Transactions
                .Include(x => x.ProductTransactions)
                .FirstOrDefaultAsync(x => x.InvoiceNo == "INV-TEST-001", cancellationToken);

            Assert.NotNull(savedTransaction);
            Assert.Single(savedTransaction.ProductTransactions);
        }

        [Fact]
        public async Task RegisterTransactionWithBusinessLogic_WithExistingTransaction_ShouldUpdateTransaction()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;

            // Create an existing transaction first
            var existingTransaction = new Transaction
            {
                Id = 200,
                InvoiceNo = "INV-EXISTING-001",
                TransactionDate = DateTime.Now.AddDays(-1),
                Status = TransactionStatusEnum.Draft,
                ModeOfPayment = (int)ModeOfPaymentEnum.Cash,
                Discount = 0.0,
                StoreId = 1,
                IsActive = true,
                IsDelete = false,
                ProductTransactions = new List<ProductTransaction>
                {
                    new ProductTransaction
                    {
                        Id = 300,
                        ProductId = 1,
                        Price = 8.0,
                        Quantity = 3,
                        Status = PaymentStatusEnum.Unpaid,
                        IsActive = true,
                        IsDelete = false
                    }
                }
            };

            _context.Transactions.Add(existingTransaction);
            await _context.SaveChangesAsync(cancellationToken);

            var transactionInput = new TransactionInput
            {
                Id = 200, // Existing transaction
                InvoiceNo = "INV-UPDATED-001",
                TransactionDate = DateTime.Now.ToString("yyyy-MM-dd"),
                Status = TransactionStatusEnum.Confirmed,
                ModeOfPayment = (int)ModeOfPaymentEnum.Cheque,
                Discount = 10.0,
                StoreId = 1,
                Paid = true,
                ProductTransactionInputs = new List<ProductTransactionInput>
                {
                    new ProductTransactionInput
                    {
                        Id = 300, // Existing product transaction
                        ProductId = 1,
                        Price = 12.0, // Updated price
                        Quantity = 7, // Updated quantity
                        CurrentQuantity = 7
                    }
                }
            };

            // Act
            var result = await _repository.RegisterTransactionWithBusinessLogic(transactionInput, cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("INV-UPDATED-001", result.InvoiceNo);
            Assert.Equal(TransactionStatusEnum.Confirmed, result.Status);
            Assert.Equal((int)ModeOfPaymentEnum.Cheque, result.ModeOfPayment);
            Assert.Equal(10.0, result.Discount);
            Assert.Single(result.ProductTransactions);

            var productTransaction = result.ProductTransactions[0];
            Assert.Equal(12.0, productTransaction.Price);
            Assert.Equal(7, productTransaction.Quantity);
            Assert.Equal(PaymentStatusEnum.Paid, productTransaction.Status); // Should be paid since transaction is paid

            // Verify the transaction was actually updated in database
            var savedTransaction = await _context.Transactions
                .Include(x => x.ProductTransactions)
                .FirstOrDefaultAsync(x => x.Id == 200, cancellationToken);

            Assert.NotNull(savedTransaction);
            Assert.Equal("INV-UPDATED-001", savedTransaction.InvoiceNo);
            Assert.Equal(TransactionStatusEnum.Confirmed, savedTransaction.Status);
        }

        [Fact]
        public async Task RegisterTransactionWithBusinessLogic_WithAutomaticPayment_ShouldCreatePayment()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;

            var transactionInput = new TransactionInput
            {
                Id = 0, // New transaction
                InvoiceNo = "INV-AUTOPAY-001",
                TransactionDate = DateTime.Now.ToString("yyyy-MM-dd"),
                Status = TransactionStatusEnum.Confirmed,
                ModeOfPayment = (int)ModeOfPaymentEnum.Cash,
                Discount = 0.0,
                StoreId = 1,
                Paid = true, // This should trigger automatic payment
                ProductTransactionInputs = new List<ProductTransactionInput>
                {
                    new ProductTransactionInput
                    {
                        Id = 0,
                        ProductId = 1,
                        Price = 20.0,
                        Quantity = 2,
                        CurrentQuantity = 2
                    }
                }
            };

            // Act
            var result = await _repository.RegisterTransactionWithBusinessLogic(transactionInput, cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(TransactionStatusEnum.Confirmed, result.Status);
            Assert.Single(result.Payments); // Should have automatic payment

            var payment = result.Payments[0];
            Assert.Equal(result.NetTotal, payment.Amount);
            Assert.Equal("Automatic Payment Registration", payment.Notes);
            Assert.True(payment.PaymentDate <= DateTime.Now);

            // Verify product transaction status is paid
            var productTransaction = result.ProductTransactions[0];
            Assert.Equal(PaymentStatusEnum.Paid, productTransaction.Status);
        }

        [Fact]
        public async Task RegisterTransactionWithBusinessLogic_WithRemovedProductTransaction_ShouldRemoveProductTransaction()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;

            // Create an existing transaction with multiple product transactions
            var existingTransaction = new Transaction
            {
                Id = 201,
                InvoiceNo = "INV-REMOVE-001",
                TransactionDate = DateTime.Now.AddDays(-1),
                Status = TransactionStatusEnum.Draft,
                ModeOfPayment = (int)ModeOfPaymentEnum.Cash,
                Discount = 0.0,
                StoreId = 1,
                IsActive = true,
                IsDelete = false,
                ProductTransactions = new List<ProductTransaction>
                {
                    new ProductTransaction
                    {
                        Id = 301,
                        ProductId = 1,
                        Price = 10.0,
                        Quantity = 2,
                        Status = PaymentStatusEnum.Unpaid,
                        IsActive = true,
                        IsDelete = false
                    },
                    new ProductTransaction
                    {
                        Id = 302,
                        ProductId = 2,
                        Price = 15.0,
                        Quantity = 1,
                        Status = PaymentStatusEnum.Unpaid,
                        IsActive = true,
                        IsDelete = false
                    }
                }
            };

            _context.Transactions.Add(existingTransaction);
            await _context.SaveChangesAsync(cancellationToken);

            var transactionInput = new TransactionInput
            {
                Id = 201, // Existing transaction
                InvoiceNo = "INV-REMOVE-001",
                TransactionDate = DateTime.Now.ToString("yyyy-MM-dd"),
                Status = TransactionStatusEnum.Draft,
                ModeOfPayment = (int)ModeOfPaymentEnum.Cash,
                Discount = 0.0,
                StoreId = 1,
                Paid = false,
                ProductTransactionInputs = new List<ProductTransactionInput>
                {
                    new ProductTransactionInput
                    {
                        Id = 301, // Keep only the first product transaction
                        ProductId = 1,
                        Price = 10.0,
                        Quantity = 2,
                        CurrentQuantity = 2
                    }
                    // Note: product transaction with Id 302 is intentionally omitted, should be deleted
                }
            };

            // Act
            var result = await _repository.RegisterTransactionWithBusinessLogic(transactionInput, cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result.ProductTransactions); // Should now have only 1 product transaction

            var remainingProductTransaction = result.ProductTransactions[0];
            Assert.Equal(301, remainingProductTransaction.Id);
            Assert.Equal(1, remainingProductTransaction.ProductId);

            // Verify the product transaction was actually deleted from the database
            var deletedProductTransaction = await _context.ProductTransactions
                .FirstOrDefaultAsync(pt => pt.Id == 302, cancellationToken);
            Assert.Null(deletedProductTransaction); // Should be deleted

            // Verify the remaining product transaction is still in the database
            var remainingProductTransactionInDb = await _context.ProductTransactions
                .FirstOrDefaultAsync(pt => pt.Id == 301, cancellationToken);
            Assert.NotNull(remainingProductTransactionInDb);
        }

        public void Dispose()
        {
            _connection?.Dispose();
            _context?.Dispose();
        }
    }
}
