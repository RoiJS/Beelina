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

