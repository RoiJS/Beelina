using Beelina.LIB.BusinessLogic;
using Beelina.LIB.DbContexts;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Beelina.UnitTest
{
    public class ProductWarehouseStockReceiptEntryRepositoryTests : BeelinaBaseTest, IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly BeelinaClientDataContext _context;
        private readonly ProductWarehouseStockReceiptEntryRepository _repository;
        private readonly ProductRepository _productRepository;
        private readonly Mock<ICurrentUserService> _currentUserServiceMock;

        public ProductWarehouseStockReceiptEntryRepositoryTests()
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
            SeedProductWarehouseStockReceiptTestData(_context);

            // Setup mocks
            _currentUserServiceMock = new Mock<ICurrentUserService>();
            _currentUserServiceMock.Setup(x => x.CurrentUserId).Returns(FieldAgent.Id);

            // Setup repositories with real context
            var beelinaDataContext = new BeelinaDataContext(new DbContextOptions<BeelinaDataContext>(), new DataContextHelper());
            var beelinaRepository = new BeelinaRepository<ProductWarehouseStockReceiptEntry>(beelinaDataContext, _context);
            var beelinaProductRepository = new BeelinaRepository<Product>(beelinaDataContext, _context);
            var appSettings = Options.Create(new ApplicationSettings());

            // Setup required dependencies for ProductRepository
            var loggerMock = new Mock<Microsoft.Extensions.Logging.ILogger<ProductRepository>>();
            var productStockPerPanelRepoMock = new Mock<IProductStockPerPanelRepository<ProductStockPerPanel>>();
            var productStockPerWarehouseRepoMock = new Mock<IProductStockPerWarehouseRepository<ProductStockPerWarehouse>>();
            var productUnitRepoMock = new Mock<IProductUnitRepository<ProductUnit>>();
            var userAccountRepoMock = new Mock<IUserAccountRepository<UserAccount>>();
            var subscriptionRepoMock = new Mock<ISubscriptionRepository<ClientSubscription>>();

            // Create real ProductRepository
            _productRepository = new ProductRepository(
                beelinaProductRepository,
                loggerMock.Object,
                productStockPerPanelRepoMock.Object,
                productStockPerWarehouseRepoMock.Object,
                productUnitRepoMock.Object,
                userAccountRepoMock.Object,
                subscriptionRepoMock.Object,
                _currentUserServiceMock.Object);
            _productRepository.SetCurrentUserId(FieldAgent.Id);

            _repository = new ProductWarehouseStockReceiptEntryRepository(
                beelinaRepository,
                appSettings,
                _productRepository
            );
            _repository.SetCurrentUserId(AdminAccount.Id);
        }

        private void SeedProductWarehouseStockReceiptTestData(BeelinaClientDataContext context)
        {
            // Get the first ProductStockPerWarehouse ID for testing
            var firstProductStockPerWarehouse = context.ProductStockPerWarehouse.FirstOrDefault();
            if (firstProductStockPerWarehouse == null)
            {
                throw new InvalidOperationException("No ProductStockPerWarehouse data found. Ensure base test data is seeded properly.");
            }

            // Add existing stock receipt entry
            var existingEntry = new ProductWarehouseStockReceiptEntry
            {
                Id = 100,
                SupplierId = 1,
                StockEntryDate = DateTime.Now.AddDays(-1),
                ReferenceNo = "REF-001",
                PlateNo = "ABC-123",
                WarehouseId = 1,
                Notes = "Test entry",
                IsActive = true,
                IsDelete = false,
                DateCreated = DateTime.Now,
                ProductStockWarehouseAudits = new List<ProductStockWarehouseAudit>
                {
                    new ProductStockWarehouseAudit
                    {
                        Id = 200,
                        ProductStockPerWarehouseId = firstProductStockPerWarehouse.Id,
                        ProductWarehouseStockReceiptEntryId = 100,
                        Quantity = 10,
                        StockAuditSource = StockAuditSourceEnum.OrderFromSupplier,
                        IsActive = true,
                        IsDelete = false,
                        DateCreated = DateTime.Now
                    }
                }
            };

            context.ProductWarehouseStockReceiptEntries.Add(existingEntry);
            context.SaveChanges();
        }
        [Fact]
        public async Task UpdateProductWarehouseStockReceiptEntriesWithBusinessLogic_WithNewEntry_ShouldCreateNewEntry()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;

            var input = new ProductWarehouseStockReceiptEntryInput
            {
                Id = 0, // New entry
                SupplierId = 1,
                StockEntryDate = DateTime.Now.ToString("yyyy-MM-dd"),
                ReferenceNo = "REF-NEW-001",
                PlateNo = "XYZ-789",
                WarehouseId = 1,
                Notes = "New test entry",
                ProductStockWarehouseAuditInputs = new List<ProductStockWarehouseAuditInput>
                {
                    new ProductStockWarehouseAuditInput
                    {
                        Id = 0,
                        ProductId = 1,
                        Quantity = 5,
                        PricePerUnit = 15.0f,
                        StockAuditSource = StockAuditSourceEnum.OrderFromSupplier
                    }
                }
            };

            // Act
            var result = await _repository.UpdateProductWarehouseStockReceiptEntriesBatch(
                new List<ProductWarehouseStockReceiptEntryInput> { input }, cancellationToken);

            // Assert
            Assert.Single(result);
            var createdEntry = result[0];
            Assert.Equal(1, createdEntry.SupplierId);
            Assert.Equal("REF-NEW-001", createdEntry.ReferenceNo);
            Assert.Equal("XYZ-789", createdEntry.PlateNo);
            Assert.Equal(1, createdEntry.WarehouseId);
            Assert.Equal("New test entry", createdEntry.Notes);
            Assert.Single(createdEntry.ProductStockWarehouseAudits);

            var audit = createdEntry.ProductStockWarehouseAudits[0];
            Assert.Equal(5, audit.Quantity);
            Assert.Equal(StockAuditSourceEnum.OrderFromSupplier, audit.StockAuditSource);

            // Verify the entry was actually saved to database
            var savedEntry = await _context.ProductWarehouseStockReceiptEntries
                .Include(x => x.ProductStockWarehouseAudits)
                .FirstOrDefaultAsync(x => x.ReferenceNo == "REF-NEW-001", cancellationToken);

            Assert.NotNull(savedEntry);
            Assert.Single(savedEntry.ProductStockWarehouseAudits);
        }

        [Fact]
        public async Task UpdateProductWarehouseStockReceiptEntriesWithBusinessLogic_WithExistingEntry_ShouldUpdateEntry()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;

            var input = new ProductWarehouseStockReceiptEntryInput
            {
                Id = 100, // Existing entry
                SupplierId = 1,
                StockEntryDate = DateTime.Now.ToString("yyyy-MM-dd"),
                ReferenceNo = "REF-UPDATED-001",
                PlateNo = "UPD-456",
                WarehouseId = 1,
                Notes = "Updated test entry",
                ProductStockWarehouseAuditInputs = new List<ProductStockWarehouseAuditInput>
                {
                    new ProductStockWarehouseAuditInput
                    {
                        Id = 200, // Existing audit
                        ProductId = 1,
                        Quantity = 15, // Updated quantity
                        PricePerUnit = 20.0f, // Updated price
                        StockAuditSource = StockAuditSourceEnum.OrderFromSupplier
                    }
                }
            };

            // Act
            var result = await _repository.UpdateProductWarehouseStockReceiptEntriesBatch(
                new List<ProductWarehouseStockReceiptEntryInput> { input }, cancellationToken);

            // Assert
            Assert.Single(result);
            var updatedEntry = result[0];
            Assert.Equal(100, updatedEntry.Id);
            Assert.Equal("REF-UPDATED-001", updatedEntry.ReferenceNo);
            Assert.Equal("UPD-456", updatedEntry.PlateNo);
            Assert.Equal("Updated test entry", updatedEntry.Notes);
            Assert.Single(updatedEntry.ProductStockWarehouseAudits);

            var audit = updatedEntry.ProductStockWarehouseAudits[0];
            Assert.Equal(200, audit.Id);
            Assert.Equal(15, audit.Quantity);

            // Verify the entry was actually updated in database
            var savedEntry = await _context.ProductWarehouseStockReceiptEntries
                .Include(x => x.ProductStockWarehouseAudits)
                .FirstOrDefaultAsync(x => x.Id == 100, cancellationToken);

            Assert.NotNull(savedEntry);
            Assert.Equal("REF-UPDATED-001", savedEntry.ReferenceNo);
            Assert.Equal("UPD-456", savedEntry.PlateNo);
            Assert.Equal("Updated test entry", savedEntry.Notes);
        }

        [Fact]
        public async Task UpdateProductWarehouseStockReceiptEntriesWithBusinessLogic_WithNewAudit_ShouldAddAudit()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;

            var input = new ProductWarehouseStockReceiptEntryInput
            {
                Id = 100, // Existing entry
                SupplierId = 1,
                StockEntryDate = DateTime.Now.ToString("yyyy-MM-dd"),
                ReferenceNo = "REF-001",
                PlateNo = "ABC-123",
                WarehouseId = 1,
                Notes = "Test entry",
                ProductStockWarehouseAuditInputs = new List<ProductStockWarehouseAuditInput>
                {
                    new ProductStockWarehouseAuditInput
                    {
                        Id = 200, // Existing audit
                        ProductId = 1,
                        Quantity = 10,
                        PricePerUnit = 15.0f,
                        StockAuditSource = StockAuditSourceEnum.OrderFromSupplier
                    },
                    new ProductStockWarehouseAuditInput
                    {
                        Id = 0, // New audit
                        ProductId = 2,
                        Quantity = 8,
                        PricePerUnit = 12.0f,
                        StockAuditSource = StockAuditSourceEnum.OrderFromSupplier
                    }
                }
            };

            // Act
            var result = await _repository.UpdateProductWarehouseStockReceiptEntriesBatch(
                new List<ProductWarehouseStockReceiptEntryInput> { input }, cancellationToken);

            // Assert
            Assert.Single(result);
            var updatedEntry = result[0];
            Assert.Equal(2, updatedEntry.ProductStockWarehouseAudits.Count);

            var existingAudit = updatedEntry.ProductStockWarehouseAudits.FirstOrDefault(a => a.Id == 200);
            Assert.NotNull(existingAudit);
            Assert.Equal(10, existingAudit.Quantity);

            var newAudit = updatedEntry.ProductStockWarehouseAudits.LastOrDefault();
            Assert.NotNull(newAudit);
            Assert.Equal(8, newAudit.Quantity);
        }

        [Fact]
        public async Task UpdateProductWarehouseStockReceiptEntriesWithBusinessLogic_WithRemovedAudit_ShouldMarkAsDeleted()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;

            // Add another audit to the existing entry
            var additionalAudit = new ProductStockWarehouseAudit
            {
                Id = 201,
                ProductStockPerWarehouseId = 2,
                ProductWarehouseStockReceiptEntryId = 100,
                Quantity = 5,
                StockAuditSource = StockAuditSourceEnum.OrderFromSupplier,
                IsActive = true,
                IsDelete = false,
                DateCreated = DateTime.Now
            };
            _context.ProductStockWarehouseAudit.Add(additionalAudit);
            await _context.SaveChangesAsync();

            var input = new ProductWarehouseStockReceiptEntryInput
            {
                Id = 100, // Existing entry
                SupplierId = 1,
                StockEntryDate = DateTime.Now.ToString("yyyy-MM-dd"),
                ReferenceNo = "REF-001",
                PlateNo = "ABC-123",
                WarehouseId = 1,
                Notes = "Test entry",
                ProductStockWarehouseAuditInputs = new List<ProductStockWarehouseAuditInput>
                {
                    new ProductStockWarehouseAuditInput
                    {
                        Id = 200, // Keep only first audit
                        ProductId = 1,
                        Quantity = 10,
                        PricePerUnit = 15.0f,
                        StockAuditSource = StockAuditSourceEnum.OrderFromSupplier
                    }
                    // Note: audit with Id 201 is intentionally omitted, should be marked as deleted
                }
            };

            // Act
            var result = await _repository.UpdateProductWarehouseStockReceiptEntriesBatch(
                new List<ProductWarehouseStockReceiptEntryInput> { input }, cancellationToken);

            // Assert
            Assert.Single(result);
            var updatedEntry = result[0];
            Assert.Single(updatedEntry.ProductStockWarehouseAudits);

            var keptAudit = updatedEntry.ProductStockWarehouseAudits.FirstOrDefault(a => a.Id == 200);
            Assert.NotNull(keptAudit);
            Assert.False(keptAudit.IsDelete);

            var deletedAudit = updatedEntry.ProductStockWarehouseAudits.FirstOrDefault(a => a.Id == 201);
            Assert.Null(deletedAudit);
        }

        [Fact]
        public async Task UpdateProductWarehouseStockReceiptEntriesWithBusinessLogic_WithCancellationToken_ShouldRespectCancellation()
        {
            // Arrange
            var cancellationTokenSource = new CancellationTokenSource();
            cancellationTokenSource.Cancel(); // Cancel immediately

            var input = new ProductWarehouseStockReceiptEntryInput
            {
                Id = 0,
                SupplierId = 1,
                StockEntryDate = DateTime.Now.ToString("yyyy-MM-dd"),
                ReferenceNo = "REF-CANCEL-001",
                PlateNo = "CAN-789",
                WarehouseId = 1,
                Notes = "Cancelled entry",
                ProductStockWarehouseAuditInputs = new List<ProductStockWarehouseAuditInput>()
            };

            // Act & Assert
            await Assert.ThrowsAsync<OperationCanceledException>(async () =>
            {
                await _repository.UpdateProductWarehouseStockReceiptEntriesBatch(
                    new List<ProductWarehouseStockReceiptEntryInput> { input }, cancellationTokenSource.Token);
            });
        }

        public void Dispose()
        {
            _connection?.Dispose();
            _context?.Dispose();
        }
    }
}
