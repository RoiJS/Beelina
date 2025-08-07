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
using Xunit;

namespace Beelina.UnitTest
{
    public class ProductRepositoryTest : BeelinaBaseTest, IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly BeelinaClientDataContext _context;
        private readonly ProductRepository _productRepository;
        private readonly ILogger<ProductRepository> _logger;

        public ProductRepositoryTest()
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

            // Setup logger (can use NullLogger or a mock)
            _logger = new LoggerFactory().CreateLogger<ProductRepository>();

            // Setup repositories with real context
            var beelinaDataContext = new BeelinaDataContext(new DbContextOptions<BeelinaDataContext>(), new DataContextHelper());
            var beelinaRepository = new BeelinaRepository<Product>(beelinaDataContext, _context);
            var beelinaProductStockPerPanelRepository = new BeelinaRepository<ProductStockPerPanel>(beelinaDataContext, _context);
            var productStockPerPanelRepository = new ProductStockPerPanelRepository(beelinaProductStockPerPanelRepository);
            var beelinaProductStockPerWarehouseRepository = new BeelinaRepository<ProductStockPerWarehouse>(beelinaDataContext, _context);
            var productStockPerWarehouseRepository = new ProductStockPerWarehouseRepository(beelinaProductStockPerWarehouseRepository);
            var beelinaProductUnitRepository = new BeelinaRepository<ProductUnit>(beelinaDataContext, _context);
            var productUnitRepository = new ProductUnitRepository(beelinaProductUnitRepository);
            var beelinaUserAccountRepository = new BeelinaRepository<UserAccount>(beelinaDataContext, _context);
            var userAccountRepository = new UserAccountRepository(beelinaUserAccountRepository);
            var beelinaClientSubscriptionRepository = new BeelinaRepository<ClientSubscription>(beelinaDataContext, _context);
            var emailServerSettingsOptions = Microsoft.Extensions.Options.Options.Create(new EmailServerSettings());
            var subscriptionLogger = new LoggerFactory().CreateLogger<SubscriptionRepository>();
            var currentUserService = new TestCurrentUserService { CurrentUserId = 1 };
            var subscriptionRepository = new SubscriptionRepository(
                beelinaClientSubscriptionRepository,
                emailServerSettingsOptions,
                currentUserService,
                subscriptionLogger
            );

            AddGeneralSettings();

            _productRepository = new ProductRepository(
                beelinaRepository,
                _logger,
                productStockPerPanelRepository,
                productStockPerWarehouseRepository,
                productUnitRepository,
                userAccountRepository,
                subscriptionRepository,
                currentUserService
            );
        }

        private void AddGeneralSettings()
        {
            var generalSetting = new GeneralSetting
            {
                Id = 1,
                BusinessModel = BusinessModelEnum.WarehousePanelMonitoring
            };
            _context.GeneralSettings.Add(generalSetting);
            _context.SaveChanges();
        }

        [Fact]
        public async Task CreateOrUpdatePanelProducts_ShouldRegisterNewProduct_AndCommitTransaction()
        {
            var userAccountId = AdminAccount.Id;
            var warehouseId = 1;
            var productInputs = new List<ProductInput>
            {
                new() {
                    Id = 0,
                    Name = "Test Product",
                    Code = "TP001",
                    Description = "Test Desc",
                    IsTransferable = true,
                    NumberOfUnits = 10,
                    SupplierId = 2,
                    ProductUnitInput = new ProductUnitInput { Name = "Unit" },
                    PricePerUnit = 100
                }
            };

            // Act
            var result = await _productRepository.CreateOrUpdatePanelProducts(userAccountId, warehouseId, productInputs);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);

            var savedProduct = await _context.Products.FirstOrDefaultAsync(p => p.Code == "TP001");
            Assert.NotNull(savedProduct);
            Assert.Equal("Test Product", savedProduct.Name);
            Assert.Equal("TP001", savedProduct.Code);
            Assert.Equal("Test Desc", savedProduct.Description);
        }

        [Fact]
        public async Task CreateOrUpdatePanelProducts_ShouldRollbackTransaction_OnException()
        {
            var userAccountId = AdminAccount.Id;
            var warehouseId = 1;
            var productInputs = new List<ProductInput>
            {
            new() {
                Id = 0,
                Name = "Rollback Product",
                Code = "RB001",
                Description = "Should Rollback",
                IsTransferable = true,
                NumberOfUnits = 5,
                SupplierId = 2,
                ProductUnitInput = new ProductUnitInput { Name = "Unit" },
                PricePerUnit = 50
            }
            };

            // Simulate exception by disposing context before call
            _context.Dispose();

            await Assert.ThrowsAsync<ObjectDisposedException>(async () =>
            {
                await _productRepository.CreateOrUpdatePanelProducts(userAccountId, warehouseId, productInputs);
            });

            // Assert product was not saved
            using var checkContext = new BeelinaClientDataContext(
            new DbContextOptionsBuilder<BeelinaClientDataContext>().UseSqlite(_connection).Options,
            new DataContextHelper()
            );
            var rolledBackProduct = await checkContext.Products.FirstOrDefaultAsync(p => p.Code == "RB001");
            Assert.Null(rolledBackProduct);
        }

        [Fact]
        public async Task CreateOrUpdatePanelProducts_ShouldUpdateExistingProduct()
        {
            var userAccountId = AdminAccount.Id;
            var warehouseId = 1;
            var existingProduct = await _context.Products.AsNoTracking().FirstAsync();
            var productInputs = new List<ProductInput>
            {
            new() {
                Id = existingProduct.Id,
                Name = "Updated Name",
                Code = "PR-00001",
                Description = "Updated Desc",
                IsTransferable = !existingProduct.IsTransferable,
                NumberOfUnits = existingProduct.NumberOfUnits + 1,
                SupplierId = 2,
                ProductUnitInput = new ProductUnitInput { Name = "Unit" }
            }
            };

            var result = await _productRepository.CreateOrUpdatePanelProducts(userAccountId, warehouseId, productInputs);

            Assert.NotNull(result);
            Assert.Single(result);

            var updatedProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == existingProduct.Id);
            Assert.NotNull(updatedProduct);
            Assert.Equal("Updated Name", updatedProduct.Name);
            Assert.Equal("Updated Desc", updatedProduct.Description);
            Assert.Equal("PR-00001", updatedProduct.Code);
            Assert.Equal(!existingProduct.IsTransferable, updatedProduct.IsTransferable);
            Assert.Equal(2, updatedProduct.SupplierId);
            Assert.Equal(existingProduct.NumberOfUnits + 1, updatedProduct.NumberOfUnits);
        }

        [Fact]
        public async Task ResetSalesAgentProductStocks_ShouldReturnTrue_WhenProductsExistWithStock()
        {
            // Arrange
            var salesAgentId = FieldAgent.Id;
            var currentUserId = AdminAccount.Id;

            // Add a product with stock for the sales agent (using IDs that don't conflict with seeded data)
            var product = new Product
            {
                Id = 1000,
                Name = "Test Product",
                Code = "TEST001",
                IsActive = true,
                IsDelete = false,
                NumberOfUnits = 1,
                ProductUnitId = 1,
                SupplierId = 1
            };

            var productStockPerPanel = new ProductStockPerPanel
            {
                Id = 2000,
                ProductId = product.Id,
                UserAccountId = salesAgentId,
                StockQuantity = 50,
                PricePerUnit = 10.0f,
                IsActive = true,
                IsDelete = false
            };

            var productStockAudit = new ProductStockAudit
            {
                Id = 3000,
                ProductStockPerPanelId = productStockPerPanel.Id,
                Quantity = 50,
                StockAuditSource = StockAuditSourceEnum.OrderFromSupplier,
                IsActive = true,
                IsDelete = false
            };

            _context.Products.Add(product);
            _context.ProductStockPerPanels.Add(productStockPerPanel);
            _context.ProductStockAudits.Add(productStockAudit);
            await _context.SaveChangesAsync();

            // Act
            var result = await _productRepository.ResetSalesAgentProductStocks(salesAgentId, currentUserId);

            // Assert
            Assert.True(result);

            // Verify that reset audit entries were created
            var resetAudits = _context.ProductStockAudits
                .Where(psa => psa.StockAuditSource == StockAuditSourceEnum.ResetProductStock)
                .ToList();

            Assert.Single(resetAudits);
            Assert.Equal(-50, resetAudits.First().Quantity);
            Assert.Equal(productStockPerPanel.Id, resetAudits.First().ProductStockPerPanelId);
        }

        [Fact]
        public async Task ResetSalesAgentProductStocks_ShouldReturnTrue_WhenNoProductsWithStock()
        {
            // Arrange
            var salesAgentId = FieldAgent.Id;
            var currentUserId = AdminAccount.Id;

            // Add a product with zero stock for the sales agent
            var product = new Product
            {
                Id = 1001,
                Name = "Test Product Zero",
                Code = "TEST002",
                IsActive = true,
                IsDelete = false,
                NumberOfUnits = 1,
                ProductUnitId = 1,
                SupplierId = 1
            };

            var productStockPerPanel = new ProductStockPerPanel
            {
                Id = 2001,
                ProductId = product.Id,
                UserAccountId = salesAgentId,
                StockQuantity = 0,
                PricePerUnit = 10.0f,
                IsActive = true,
                IsDelete = false
            };

            _context.Products.Add(product);
            _context.ProductStockPerPanels.Add(productStockPerPanel);
            await _context.SaveChangesAsync();

            // Act
            var result = await _productRepository.ResetSalesAgentProductStocks(salesAgentId, currentUserId);

            // Assert
            Assert.True(result);

            // Verify that no reset audit entries were created (since no stock to reset)
            var resetAudits = _context.ProductStockAudits
                .Where(psa => psa.StockAuditSource == StockAuditSourceEnum.ResetProductStock)
                .ToList();

            Assert.Empty(resetAudits);
        }

        [Fact]
        public async Task ResetSalesAgentProductStocks_ShouldReturnTrue_WhenSalesAgentHasNoProducts()
        {
            // Arrange
            var salesAgentId = 999; // Non-existent sales agent
            var currentUserId = AdminAccount.Id;

            // Act
            var result = await _productRepository.ResetSalesAgentProductStocks(salesAgentId, currentUserId);

            // Assert
            Assert.True(result);

            // Verify that no reset audit entries were created
            var resetAudits = _context.ProductStockAudits
                .Where(psa => psa.StockAuditSource == StockAuditSourceEnum.ResetProductStock)
                .ToList();

            Assert.Empty(resetAudits);
        }

        [Fact]
        public async Task ResetSalesAgentProductStocks_ShouldCreateMultipleAudits_WhenMultipleProductsWithStock()
        {
            // Arrange
            var salesAgentId = FieldAgent.Id;
            var currentUserId = AdminAccount.Id;

            // Add multiple products with stock for the sales agent
            var products = new List<Product>
            {
                new() {
                    Id = 1002,
                    Name = "Test Product 1",
                    Code = "TEST003",
                    IsActive = true,
                    IsDelete = false,
                    NumberOfUnits = 1,
                    ProductUnitId = 1,
                    SupplierId = 1
                },
                new() {
                    Id = 1003,
                    Name = "Test Product 2",
                    Code = "TEST004",
                    IsActive = true,
                    IsDelete = false,
                    NumberOfUnits = 1,
                    ProductUnitId = 1,
                    SupplierId = 1
                }
            };

            var productStockPerPanels = new List<ProductStockPerPanel>
            {
                new() {
                    Id = 2002,
                    ProductId = 1002,
                    UserAccountId = salesAgentId,
                    StockQuantity = 30,
                    PricePerUnit = 10.0f,
                    IsActive = true,
                    IsDelete = false
                },
                new() {
                    Id = 2003,
                    ProductId = 1003,
                    UserAccountId = salesAgentId,
                    StockQuantity = 25,
                    PricePerUnit = 15.0f,
                    IsActive = true,
                    IsDelete = false
                }
            };

            var productStockAudits = new List<ProductStockAudit>
            {
                new() {
                    Id = 3001,
                    ProductStockPerPanelId = 2002,
                    Quantity = 30,
                    StockAuditSource = StockAuditSourceEnum.OrderFromSupplier,
                    IsActive = true,
                    IsDelete = false
                },
                new() {
                    Id = 3002,
                    ProductStockPerPanelId = 2003,
                    Quantity = 25,
                    StockAuditSource = StockAuditSourceEnum.OrderFromSupplier,
                    IsActive = true,
                    IsDelete = false
                }
            };

            _context.Products.AddRange(products);
            _context.ProductStockPerPanels.AddRange(productStockPerPanels);
            _context.ProductStockAudits.AddRange(productStockAudits);
            await _context.SaveChangesAsync();

            // Act
            var result = await _productRepository.ResetSalesAgentProductStocks(salesAgentId, currentUserId);

            // Assert
            Assert.True(result);

            // Verify that reset audit entries were created for both products
            var resetAudits = _context.ProductStockAudits
                .Where(psa => psa.StockAuditSource == StockAuditSourceEnum.ResetProductStock)
                .OrderBy(psa => psa.ProductStockPerPanelId)
                .ToList();

            Assert.Equal(2, resetAudits.Count);
            Assert.Equal(-30, resetAudits[0].Quantity);
            Assert.Equal(-25, resetAudits[1].Quantity);
            Assert.Equal(2002, resetAudits[0].ProductStockPerPanelId);
            Assert.Equal(2003, resetAudits[1].ProductStockPerPanelId);
        }

        [Fact]
        public async Task ResetSalesAgentProductStocks_ShouldHaveCorrectAuditProperties()
        {
            // Arrange
            var salesAgentId = FieldAgent.Id;
            var currentUserId = AdminAccount.Id;

            // Add a product with stock for the sales agent
            var product = new Product
            {
                Id = 1004,
                Name = "Test Product Properties",
                Code = "TEST005",
                IsActive = true,
                IsDelete = false,
                NumberOfUnits = 1,
                ProductUnitId = 1,
                SupplierId = 1
            };

            var productStockPerPanel = new ProductStockPerPanel
            {
                Id = 2004,
                ProductId = product.Id,
                UserAccountId = salesAgentId,
                StockQuantity = 75,
                PricePerUnit = 20.0f,
                IsActive = true,
                IsDelete = false
            };

            var productStockAudit = new ProductStockAudit
            {
                Id = 3003,
                ProductStockPerPanelId = productStockPerPanel.Id,
                Quantity = 75,
                StockAuditSource = StockAuditSourceEnum.OrderFromSupplier,
                IsActive = true,
                IsDelete = false
            };

            _context.Products.Add(product);
            _context.ProductStockPerPanels.Add(productStockPerPanel);
            _context.ProductStockAudits.Add(productStockAudit);
            await _context.SaveChangesAsync();

            // Act
            var result = await _productRepository.ResetSalesAgentProductStocks(salesAgentId, currentUserId);

            // Assert
            Assert.True(result);

            // Verify audit entry properties
            var resetAudit = _context.ProductStockAudits
                .Where(psa => psa.StockAuditSource == StockAuditSourceEnum.ResetProductStock)
                .First();

            Assert.Equal(StockAuditSourceEnum.ResetProductStock, resetAudit.StockAuditSource);
            Assert.Equal(1, resetAudit.ProductWithdrawalEntryId); // Default value
            Assert.Equal(-75, resetAudit.Quantity);
            Assert.Equal(productStockPerPanel.Id, resetAudit.ProductStockPerPanelId);
        }

        public void Dispose()
        {
            _connection?.Dispose();
            _context?.Dispose();
        }
    }

    // Dummy implementation for ICurrentUserService for testing
    public class TestCurrentUserService : ICurrentUserService
    {
        public int CurrentUserId { get; set; }
        public string AppSecretToken => "dummy";

        public string CurrrentUserEmailAddress => throw new NotImplementedException();

        public string CurrrentName => throw new NotImplementedException();

        public BusinessModelEnum CurrrentBusinessModel => throw new NotImplementedException();
    }
}

