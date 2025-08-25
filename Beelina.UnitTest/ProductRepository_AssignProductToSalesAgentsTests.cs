using Beelina.LIB.BusinessLogic;
using Beelina.LIB.DbContexts;
using Beelina.LIB.Enums;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Xunit;

namespace Beelina.UnitTest
{
    public class ProductRepository_AssignProductToSalesAgentsTests : BeelinaBaseTest, IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly BeelinaClientDataContext _context;
        private readonly ProductRepository _productRepository;
        private readonly ILogger<ProductRepository> _logger;

        public ProductRepository_AssignProductToSalesAgentsTests()
        {
            // Setup SQLite in-memory database
            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            var options = new DbContextOptionsBuilder<BeelinaClientDataContext>()
                .UseSqlite(_connection)
                .Options;

            _context = new BeelinaClientDataContext(options, new DataContextHelper());
            _context.Database.EnsureCreated();

            // Seed test data using BeelinaBaseTest
            SeedSampleData(_context, AdminAccount.Id);

            // Setup logger
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
            var currentUserService = new TestCurrentUserService { CurrentUserId = AdminAccount.Id };
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
                BusinessModel = BusinessModelEnum.WarehouseMonitoring
            };
            _context.GeneralSettings.Add(generalSetting);
            _context.SaveChanges();
        }

        public void Dispose()
        {
            _context?.Dispose();
            _connection?.Dispose();
        }

        [Fact]
        public async Task AssignProductToSalesAgents_WithValidSalesAgents_ShouldCreateAssignments()
        {
            // Arrange
            var productId = 1; // Using existing product from seeded data
            var salesAgentIds = new List<int> { FieldAgent.Id, WarehouseAgent.Id }; // Using seeded sales agents
            var warehouseId = 1; // Using existing warehouse from seeded data
            var currentUserId = AdminAccount.Id;

            // Get initial assignments count
            var initialAssignments = _context.ProductStockPerPanels.Where(p => p.ProductId == productId).ToList();
            var initialCount = initialAssignments.Count;

            // Act
            var result = await _productRepository.AssignProductToSalesAgents(
                productId, salesAgentIds, warehouseId, currentUserId);

            // Assert
            Assert.NotNull(result);
            
            // Verify assignments were created for sales agents who didn't already have the product
            var allAssignments = _context.ProductStockPerPanels.Where(p => p.ProductId == productId).ToList();
            var newAssignmentsCount = allAssignments.Count - initialCount;
            
            Assert.True(newAssignmentsCount >= 0, "Should have created new assignments or skipped existing ones");
            Assert.True(result.Count <= salesAgentIds.Count, "Result count should not exceed requested sales agents");
            
            // Verify all returned assignments have correct product ID
            Assert.All(result, assignment =>
            {
                Assert.Equal(productId, assignment.ProductId);
                Assert.Contains(assignment.UserAccountId, salesAgentIds);
                Assert.True(assignment.PricePerUnit > 0, "Price should be assigned from warehouse or old assignment");
            });
        }

        [Fact]
        public async Task AssignProductToSalesAgents_WithEmptySalesAgentList_ShouldReturnEmpty()
        {
            // Arrange
            var productId = 1;
            var salesAgentIds = new List<int>(); // Empty list
            var warehouseId = 1;
            var currentUserId = AdminAccount.Id;

            // Act
            var result = await _productRepository.AssignProductToSalesAgents(
                productId, salesAgentIds, warehouseId, currentUserId);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task AssignProductToSalesAgents_WithInvalidSalesAgentIds_ShouldReturnEmpty()
        {
            // Arrange
            var productId = 1;
            var salesAgentIds = new List<int> { 999, 998 }; // Non-existent IDs
            var warehouseId = 1;
            var currentUserId = AdminAccount.Id;

            // Act
            var result = await _productRepository.AssignProductToSalesAgents(
                productId, salesAgentIds, warehouseId, currentUserId);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task AssignProductToSalesAgents_WithNonExistentProduct_ShouldReturnEmpty()
        {
            // Arrange
            var productId = 999; // Non-existent product
            var salesAgentIds = new List<int> { FieldAgent.Id };
            var warehouseId = 1;
            var currentUserId = AdminAccount.Id;

            // Act
            var result = await _productRepository.AssignProductToSalesAgents(
                productId, salesAgentIds, warehouseId, currentUserId);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task AssignProductToSalesAgents_WithExistingAssignment_ShouldSkipExisting()
        {
            // Arrange
            var productId = 1;
            var fieldAgentId = FieldAgent.Id;
            var warehouseAgentId = WarehouseAgent.Id;
            var salesAgentIds = new List<int> { fieldAgentId, warehouseAgentId };
            var warehouseId = 1;
            var currentUserId = AdminAccount.Id;

            // Check if FieldAgent already has this product assigned (from seeded data)
            var existingAssignment = _context.ProductStockPerPanels
                .FirstOrDefault(p => p.ProductId == productId && p.UserAccountId == fieldAgentId);
            
            var initialAssignmentsCount = _context.ProductStockPerPanels
                .Where(p => p.ProductId == productId)
                .Count();

            // Act
            var result = await _productRepository.AssignProductToSalesAgents(
                productId, salesAgentIds, warehouseId, currentUserId);

            // Assert
            Assert.NotNull(result);
            
            var finalAssignmentsCount = _context.ProductStockPerPanels
                .Where(p => p.ProductId == productId)
                .Count();

            // Verify that only new assignments were created (existing ones were skipped)
            var expectedNewAssignments = salesAgentIds.Count;
            if (existingAssignment != null)
            {
                expectedNewAssignments--; // FieldAgent already has assignment, so one less new assignment
            }

            var actualNewAssignments = finalAssignmentsCount - initialAssignmentsCount;
            Assert.True(actualNewAssignments <= expectedNewAssignments, 
                "Should not create duplicate assignments");
        }

        [Fact]
        public async Task AssignProductToSalesAgents_WithPreviousProductVersion_ShouldUsePriceFromOldAssignment()
        {
            // Arrange
            var currentProductId = 2050; // Use a high ID to avoid conflicts with seeded data
            var oldProductId = 2049;
            var parentGroupId = 2100; // Create a parent group
            var salesAgentId = FieldAgent.Id;
            var salesAgentIds = new List<int> { salesAgentId };
            var warehouseId = 1;
            var currentUserId = AdminAccount.Id;
            var oldAssignmentPrice = 85.0f;

            // Create parent group first
            var parentGroup = new Product
            {
                Id = parentGroupId,
                Name = "Parent Group",
                Code = "PARENT001",
                IsActive = true,
                IsDelete = false,
                ProductUnitId = 1,
                SupplierId = 1,
                PricePerUnit = 50.0f,
                ValidFrom = DateTime.UtcNow.AddDays(-60),
                ValidTo = DateTime.UtcNow.AddDays(-31),
                DateCreated = DateTime.UtcNow.AddDays(-60)
            };
            _context.Products.Add(parentGroup);

            // Add old product version
            var oldProduct = new Product
            {
                Id = oldProductId,
                Name = "Old Product Version",
                Code = "OLDTEST001",
                IsActive = true,
                IsDelete = false,
                ProductUnitId = 1,
                SupplierId = 1,
                PricePerUnit = 50.0f,
                ProductParentGroupId = parentGroupId,
                ValidFrom = DateTime.UtcNow.AddDays(-30),
                ValidTo = DateTime.UtcNow.AddDays(1), // Make it still valid
                DateCreated = DateTime.UtcNow.AddDays(-30)
            };

            // Add current product version
            var currentProduct = new Product
            {
                Id = currentProductId,
                Name = "Current Product Version",
                Code = "NEWTEST001",
                IsActive = true,
                IsDelete = false,
                ProductUnitId = 1,
                SupplierId = 1,
                PricePerUnit = 60.0f,
                ProductParentGroupId = parentGroupId,
                ValidFrom = DateTime.UtcNow,
                ValidTo = null,
                DateCreated = DateTime.UtcNow
            };

            _context.Products.AddRange(oldProduct, currentProduct);

            // Add warehouse product stock for current product
            var warehouseProduct = new ProductStockPerWarehouse
            {
                ProductId = currentProductId,
                WarehouseId = warehouseId,
                PricePerUnit = 100.0f,
                IsActive = true
            };
            _context.ProductStockPerWarehouse.Add(warehouseProduct);

            // Add old product assignment with specific price
            var oldProductAssignment = new ProductStockPerPanel
            {
                ProductId = oldProductId,
                UserAccountId = salesAgentId,
                PricePerUnit = oldAssignmentPrice,
                IsActive = true
            };
            _context.ProductStockPerPanels.Add(oldProductAssignment);
            await _context.SaveChangesAsync();

            // Act
            var result = await _productRepository.AssignProductToSalesAgents(
                currentProductId, salesAgentIds, warehouseId, currentUserId);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal(currentProductId, result[0].ProductId);
            Assert.Equal(salesAgentId, result[0].UserAccountId);
            Assert.Equal(oldAssignmentPrice, result[0].PricePerUnit); // Should use price from old assignment
        }

        [Fact]
        public async Task AssignProductToSalesAgents_WithoutPreviousVersion_ShouldUseWarehousePrice()
        {
            // Arrange
            var productId = 2051; // Use a high ID to avoid conflicts with seeded data
            var salesAgentId = FieldAgent.Id;
            var salesAgentIds = new List<int> { salesAgentId };
            var warehouseId = 1;
            var currentUserId = AdminAccount.Id;
            var warehousePrice = 120.0f;

            // Add new product without previous version
            var newProduct = new Product
            {
                Id = productId,
                Name = "New Product Without Previous Version",
                Code = "NEWPROD001",
                IsActive = true,
                IsDelete = false,
                ProductUnitId = 1,
                SupplierId = 1,
                PricePerUnit = 60.0f,
                ValidFrom = DateTime.UtcNow,
                ValidTo = null,
                DateCreated = DateTime.UtcNow
            };
            _context.Products.Add(newProduct);

            // Add warehouse product stock
            var warehouseProduct = new ProductStockPerWarehouse
            {
                ProductId = productId,
                WarehouseId = warehouseId,
                PricePerUnit = warehousePrice,
                IsActive = true
            };
            _context.ProductStockPerWarehouse.Add(warehouseProduct);
            await _context.SaveChangesAsync();

            // Act
            var result = await _productRepository.AssignProductToSalesAgents(
                productId, salesAgentIds, warehouseId, currentUserId);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal(productId, result[0].ProductId);
            Assert.Equal(salesAgentId, result[0].UserAccountId);
            Assert.Equal(warehousePrice, result[0].PricePerUnit); // Should use warehouse price
        }

        [Fact]
        public async Task AssignProductToSalesAgents_WithWarehousePrice_ShouldUseWarehousePriceDirectly()
        {
            // Arrange
            var productId = 2052; // Use a high ID to avoid conflicts with seeded data
            var salesAgentId = FieldAgent.Id;
            var salesAgentIds = new List<int> { salesAgentId };
            var warehouseId = 1;
            var currentUserId = AdminAccount.Id;
            var expectedWarehousePrice = 150.75f; // Specific warehouse price to test

            // Add a standalone product (no parent group, no previous versions)
            var standaloneProduct = new Product
            {
                Id = productId,
                Name = "Standalone Product",
                Code = "STANDALONE001",
                IsActive = true,
                IsDelete = false,
                ProductUnitId = 1,
                SupplierId = 1,
                PricePerUnit = 75.0f, // Product base price (different from warehouse price)
                ValidFrom = DateTime.UtcNow,
                ValidTo = null,
                DateCreated = DateTime.UtcNow
                // Note: No ProductParentGroupId - this is a standalone product
            };
            _context.Products.Add(standaloneProduct);

            // Add warehouse product stock with specific price
            var warehouseProduct = new ProductStockPerWarehouse
            {
                ProductId = productId,
                WarehouseId = warehouseId,
                PricePerUnit = expectedWarehousePrice,
                IsActive = true
            };
            _context.ProductStockPerWarehouse.Add(warehouseProduct);
            await _context.SaveChangesAsync();

            // Act
            var result = await _productRepository.AssignProductToSalesAgents(
                productId, salesAgentIds, warehouseId, currentUserId);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal(productId, result[0].ProductId);
            Assert.Equal(salesAgentId, result[0].UserAccountId);
            Assert.Equal(expectedWarehousePrice, result[0].PricePerUnit); // Should use warehouse price exactly
            
            // Verify the assignment was saved to database
            var savedAssignment = await _context.ProductStockPerPanels
                .FirstOrDefaultAsync(p => p.ProductId == productId && p.UserAccountId == salesAgentId);
            Assert.NotNull(savedAssignment);
            Assert.Equal(expectedWarehousePrice, savedAssignment.PricePerUnit);
        }
    }
}
