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
    public class ProductRepositoryTransferStockTests : BeelinaBaseTest, IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly BeelinaClientDataContext _context;
        private readonly ProductRepository _productRepository;
        private readonly ILogger<ProductRepository> _logger;

        public ProductRepositoryTransferStockTests()
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

            // Setup additional test data for transfer stock testing
            SeedTransferStockTestData(_context);

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


        private void SeedTransferStockTestData(BeelinaClientDataContext context)
        {
            // Add GeneralSettings for business model
            var generalSetting = new GeneralSetting 
            { 
                Id = 1,
                BusinessModel = BusinessModelEnum.WarehousePanelMonitoring 
            };
            context.GeneralSettings.Add(generalSetting);

            // Add transferable products for testing
            var transferableProduct1 = new Product
            {
                Id = 100,
                Name = "Transferable Product 1",
                Code = "TRANS001",
                IsActive = true,
                IsDelete = false,
                IsTransferable = true,
                NumberOfUnits = 12, // e.g., 12 pieces per bulk
                ProductUnitId = 1,
                SupplierId = 1
            };

            var transferableProduct2 = new Product
            {
                Id = 101,
                Name = "Transferable Product 2",
                Code = "TRANS002",
                IsActive = true,
                IsDelete = false,
                IsTransferable = true,
                NumberOfUnits = 1, // individual piece
                ProductUnitId = 1,
                SupplierId = 1
            };

            context.Products.AddRange(transferableProduct1, transferableProduct2);

            // Add stock per panel for these products
            var stockPerPanel1 = new ProductStockPerPanel
            {
                Id = 200,
                ProductId = 100,
                UserAccountId = 1
            };

            var stockPerPanel2 = new ProductStockPerPanel
            {
                Id = 201,
                ProductId = 101,
                UserAccountId = 1
            };

            context.ProductStockPerPanels.AddRange(stockPerPanel1, stockPerPanel2);

            // Add initial stock audit entries to give the products some stock
            var initialStock1 = new ProductStockAudit
            {
                Id = 300,
                ProductStockPerPanelId = 200,
                Quantity = 100, // 100 bulk units
                StockAuditSource = StockAuditSourceEnum.FromWithdrawal,
                WithdrawalSlipNo = "TEST-001",
                WarehouseId = 1,
                DateCreated = DateTime.UtcNow.AddDays(-1)
            };

            var initialStock2 = new ProductStockAudit
            {
                Id = 301,
                ProductStockPerPanelId = 201,
                Quantity = 50, // 50 individual pieces
                StockAuditSource = StockAuditSourceEnum.FromWithdrawal,
                WithdrawalSlipNo = "TEST-002",
                WarehouseId = 1,
                DateCreated = DateTime.UtcNow.AddDays(-1)
            };

            context.ProductStockAudits.AddRange(initialStock1, initialStock2);
            context.SaveChanges();
        }

        [Fact]
        public async Task TransferProductStockFromOwnInventory_BulkToPiece_ShouldTransferStockSuccessfully()
        {
            // Arrange
            var userAccountId = AdminAccount.Id;
            var warehouseId = 1;
            var sourceProductId = 100; // Bulk product (12 pieces per unit)
            var destinationProductId = 101; // Individual piece product
            var destinationProductNumberOfUnits = 1;
            var sourceProductNumberOfUnits = 12;
            var sourceNumberOfUnitsTransfered = 5; // Transfer 5 bulk units
            var transferType = TransferProductStockTypeEnum.BulkToPiece;
            var cancellationToken = CancellationToken.None;

            // Get initial stock counts
            var initialSourceStock = await _context.ProductStockAudits
                .Where(a => a.ProductStockPerPanelId == 200)
                .SumAsync(a => a.Quantity, cancellationToken);
            
            var initialDestinationStock = await _context.ProductStockAudits
                .Where(a => a.ProductStockPerPanelId == 201)
                .SumAsync(a => a.Quantity, cancellationToken);

            // Act
            var result = await _productRepository.TransferProductStockFromOwnInventory(
                userAccountId,
                warehouseId,
                sourceProductId,
                destinationProductId,
                destinationProductNumberOfUnits,
                sourceProductNumberOfUnits,
                sourceNumberOfUnitsTransfered,
                transferType,
                cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(sourceProductId, result.Id);

            // Verify the source product's NumberOfUnits was updated
            var updatedSourceProduct = await _context.Products.FindAsync(sourceProductId);
            Assert.Equal(sourceProductNumberOfUnits, updatedSourceProduct?.NumberOfUnits);

            // Verify audit entries were created
            var sourceAuditEntry = await _context.ProductStockAudits
                .Where(a => a.ProductStockPerPanelId == 200 && 
                           a.StockAuditSource == StockAuditSourceEnum.MovedToOtherProductInventory)
                .OrderByDescending(a => a.DateCreated)
                .FirstOrDefaultAsync(cancellationToken);

            Assert.NotNull(sourceAuditEntry);
            Assert.Equal(-sourceNumberOfUnitsTransfered, sourceAuditEntry.Quantity);
            Assert.Equal(transferType, sourceAuditEntry.TransferProductStockType);

            var destinationAuditEntry = await _context.ProductStockAudits
                .Where(a => a.ProductStockPerPanelId == 201 && 
                           a.StockAuditSource == StockAuditSourceEnum.MovedFromOtherProductInventory)
                .OrderByDescending(a => a.DateCreated)
                .FirstOrDefaultAsync(cancellationToken);

            Assert.NotNull(destinationAuditEntry);
            // 5 bulk units * 12 pieces per unit = 60 pieces
            var expectedDestinationQuantity = sourceProductNumberOfUnits * sourceNumberOfUnitsTransfered;
            Assert.Equal(expectedDestinationQuantity, destinationAuditEntry.Quantity);
            Assert.Equal(transferType, destinationAuditEntry.TransferProductStockType);

            // Verify the audit entries reference each other
            Assert.Equal(destinationAuditEntry.ProductStockPerPanelId, sourceAuditEntry.DestinationProductStockPerPanelId);
            Assert.Equal(sourceAuditEntry.ProductStockPerPanelId, destinationAuditEntry.SourceProductStockPerPanelId);

            // Verify final stock levels
            var finalSourceStock = await _context.ProductStockAudits
                .Where(a => a.ProductStockPerPanelId == 200)
                .SumAsync(a => a.Quantity, cancellationToken);

            var finalDestinationStock = await _context.ProductStockAudits
                .Where(a => a.ProductStockPerPanelId == 201)
                .SumAsync(a => a.Quantity, cancellationToken);

            Assert.Equal(initialSourceStock - sourceNumberOfUnitsTransfered, finalSourceStock);
            Assert.Equal(initialDestinationStock + expectedDestinationQuantity, finalDestinationStock);
        }

        [Fact]
        public async Task TransferProductStockFromOwnInventory_PieceToBulk_ShouldTransferStockSuccessfully()
        {
            // Arrange
            var userAccountId = AdminAccount.Id;
            var warehouseId = 1;
            var sourceProductId = 101; // Individual piece product
            var destinationProductId = 100; // Bulk product (12 pieces per unit)
            var destinationProductNumberOfUnits = 12;
            var sourceProductNumberOfUnits = 1;
            var sourceNumberOfUnitsTransfered = 24; // Transfer 24 individual pieces
            var transferType = TransferProductStockTypeEnum.PieceToBulk;
            var cancellationToken = CancellationToken.None;

            // Get initial stock counts
            var initialSourceStock = await _context.ProductStockAudits
                .Where(a => a.ProductStockPerPanelId == 201)
                .SumAsync(a => a.Quantity, cancellationToken);
            
            var initialDestinationStock = await _context.ProductStockAudits
                .Where(a => a.ProductStockPerPanelId == 200)
                .SumAsync(a => a.Quantity, cancellationToken);

            // Act
            var result = await _productRepository.TransferProductStockFromOwnInventory(
                userAccountId,
                warehouseId,
                sourceProductId,
                destinationProductId,
                destinationProductNumberOfUnits,
                sourceProductNumberOfUnits,
                sourceNumberOfUnitsTransfered,
                transferType,
                cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(sourceProductId, result.Id);

            // Verify the destination product's NumberOfUnits was updated
            var updatedDestinationProduct = await _context.Products.FindAsync(destinationProductId);
            Assert.Equal(destinationProductNumberOfUnits, updatedDestinationProduct?.NumberOfUnits);

            // Verify audit entries were created
            var sourceAuditEntry = await _context.ProductStockAudits
                .Where(a => a.ProductStockPerPanelId == 201 && 
                           a.StockAuditSource == StockAuditSourceEnum.MovedToOtherProductInventory)
                .OrderByDescending(a => a.DateCreated)
                .FirstOrDefaultAsync(cancellationToken);

            Assert.NotNull(sourceAuditEntry);
            Assert.Equal(-sourceNumberOfUnitsTransfered, sourceAuditEntry.Quantity);
            Assert.Equal(transferType, sourceAuditEntry.TransferProductStockType);

            var destinationAuditEntry = await _context.ProductStockAudits
                .Where(a => a.ProductStockPerPanelId == 200 && 
                           a.StockAuditSource == StockAuditSourceEnum.MovedFromOtherProductInventory)
                .OrderByDescending(a => a.DateCreated)
                .FirstOrDefaultAsync(cancellationToken);

            Assert.NotNull(destinationAuditEntry);
            // 24 pieces ÷ 12 pieces per bulk unit = 2 bulk units
            var expectedDestinationQuantity = sourceNumberOfUnitsTransfered / destinationProductNumberOfUnits;
            Assert.Equal(expectedDestinationQuantity, destinationAuditEntry.Quantity);
            Assert.Equal(transferType, destinationAuditEntry.TransferProductStockType);

            // Verify the audit entries reference each other
            Assert.Equal(destinationAuditEntry.ProductStockPerPanelId, sourceAuditEntry.DestinationProductStockPerPanelId);
            Assert.Equal(sourceAuditEntry.ProductStockPerPanelId, destinationAuditEntry.SourceProductStockPerPanelId);

            // Verify final stock levels
            var finalSourceStock = await _context.ProductStockAudits
                .Where(a => a.ProductStockPerPanelId == 201)
                .SumAsync(a => a.Quantity, cancellationToken);

            var finalDestinationStock = await _context.ProductStockAudits
                .Where(a => a.ProductStockPerPanelId == 200)
                .SumAsync(a => a.Quantity, cancellationToken);

            Assert.Equal(initialSourceStock - sourceNumberOfUnitsTransfered, finalSourceStock);
            Assert.Equal(initialDestinationStock + expectedDestinationQuantity, finalDestinationStock);
        }

        [Fact]
        public async Task TransferProductStockFromOwnInventory_WithCancelledToken_ShouldThrowTaskCancelledException()
        {
            // Arrange
            var userAccountId = AdminAccount.Id;
            var warehouseId = 1;
            var sourceProductId = 100; // Bulk product (12 pieces per unit)
            var destinationProductId = 101; // Individual piece product
            var destinationProductNumberOfUnits = 1;
            var sourceProductNumberOfUnits = 12;
            var sourceNumberOfUnitsTransfered = 3; // Transfer 3 bulk units
            var transferType = TransferProductStockTypeEnum.BulkToPiece;

            // Create a cancelled cancellation token
            var cancellationTokenSource = new CancellationTokenSource();
            cancellationTokenSource.Cancel();
            var cancelledToken = cancellationTokenSource.Token;

            // Act & Assert
            var exception = await Assert.ThrowsAnyAsync<OperationCanceledException>(async () =>
            {
                await _productRepository.TransferProductStockFromOwnInventory(
                    userAccountId,
                    warehouseId,
                    sourceProductId,
                    destinationProductId,
                    destinationProductNumberOfUnits,
                    sourceProductNumberOfUnits,
                    sourceNumberOfUnitsTransfered,
                    transferType,
                    cancelledToken);
            });

            // Verify the cancellation token was the cause
            Assert.True(exception.CancellationToken.IsCancellationRequested);

            // Verify no changes were made to the database due to cancellation
            var sourceAuditEntries = await _context.ProductStockAudits
                .Where(a => a.ProductStockPerPanelId == 200 && 
                           a.StockAuditSource == StockAuditSourceEnum.MovedToOtherProductInventory)
                .CountAsync();

            var destinationAuditEntries = await _context.ProductStockAudits
                .Where(a => a.ProductStockPerPanelId == 201 && 
                           a.StockAuditSource == StockAuditSourceEnum.MovedFromOtherProductInventory)
                .CountAsync();

            // Should have no new audit entries since operation was cancelled
            Assert.Equal(0, sourceAuditEntries);
            Assert.Equal(0, destinationAuditEntries);
        }


        public void Dispose()
        {
            _connection?.Dispose();
            _context?.Dispose();
        }
    }
}
