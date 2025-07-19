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
    public class ProductWithdrawalEntryRepositoryTests : BeelinaBaseTest, IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly BeelinaClientDataContext _context;
        private readonly ProductWithdrawalEntryRepository _repository;
        private readonly Mock<IProductRepository<Product>> _productRepositoryMock;
        private readonly ILogger<ProductWithdrawalEntryRepository> _logger;

        public ProductWithdrawalEntryRepositoryTests()
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
            SeedWithdrawalTestData(_context);

            // Setup logger
            _logger = new LoggerFactory().CreateLogger<ProductWithdrawalEntryRepository>();

            // Setup mocks
            _productRepositoryMock = new Mock<IProductRepository<Product>>();

            // Setup repositories with real context
            var beelinaDataContext = new BeelinaDataContext(new DbContextOptions<BeelinaDataContext>(), new DataContextHelper());
            var beelinaRepository = new BeelinaRepository<ProductWithdrawalEntry>(beelinaDataContext, _context);
            var appSettings = Options.Create(new ApplicationSettings());

            _repository = new ProductWithdrawalEntryRepository(beelinaRepository, appSettings, _productRepositoryMock.Object);
            _repository.SetCurrentUserId(1);
        }

        private void SeedWithdrawalTestData(BeelinaClientDataContext context)
        {
            // Add GeneralSettings for business model
            var generalSetting = new GeneralSetting 
            { 
                Id = 1,
                BusinessModel = BusinessModelEnum.WarehousePanelMonitoring 
            };
            context.GeneralSettings.Add(generalSetting);

            // Add test products
            var testProduct = new Product
            {
                Id = 200,
                Name = "Test Withdrawal Product",
                Code = "TWP001",
                IsActive = true,
                IsDelete = false,
                IsTransferable = true,
                NumberOfUnits = 1,
                ProductUnitId = 1,
                SupplierId = 1
            };
            context.Products.Add(testProduct);

            // Add stock per panel for the product
            var stockPerPanel = new ProductStockPerPanel
            {
                Id = 300,
                ProductId = 200,
                UserAccountId = 1,
                PricePerUnit = 15.0f,
            };
            context.ProductStockPerPanels.Add(stockPerPanel);

            context.SaveChanges();
        }

        [Fact]
        public async Task UpdateProductWithdrawalEntries_WithNewEntry_ShouldCreateNewEntry()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;
            
            // Setup product repository mock
            _productRepositoryMock
                .Setup(x => x.ManageProductStockPerPanel(
                    It.IsAny<Product>(), 
                    It.IsAny<ProductInput>(), 
                    It.IsAny<int>(), 
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(new ProductStockPerPanel { Id = 300, ProductId = 200 });

            var inputs = new List<ProductWithdrawalEntryInput>
            {
                new ProductWithdrawalEntryInput
                {
                    Id = 0, // New entry
                    UserAccountId = 1,
                    StockEntryDate = DateTime.Now.ToString("yyyy-MM-dd"),
                    WithdrawalSlipNo = "WS-TEST-001",
                    Notes = "Test withdrawal entry",
                    ProductStockAuditsInputs = new List<ProductStockAuditInput>
                    {
                        new ProductStockAuditInput
                        {
                            Id = 0,
                            ProductId = 200,
                            ProductStockPerPanelId = 300,
                            Quantity = 10,
                            WarehouseId = 1,
                            StockAuditSource = StockAuditSourceEnum.FromWithdrawal,
                            PricePerUnit = 15.0f
                        }
                    }
                }
            };

            // Act
            var result = await _repository.UpdateProductWithdrawalEntriesWithBusinessLogic(
                inputs,
                
                cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);

            var createdEntry = result[0];
            Assert.Equal("WS-TEST-001", createdEntry.WithdrawalSlipNo);
            Assert.Equal("Test withdrawal entry", createdEntry.Notes);
            Assert.Equal(1, createdEntry.UserAccountId);
            Assert.Single(createdEntry.ProductStockAudits);

            var audit = createdEntry.ProductStockAudits[0];
            Assert.Equal(10, audit.Quantity);
            Assert.Equal(1, audit.WarehouseId);
            Assert.Equal(StockAuditSourceEnum.FromWithdrawal, audit.StockAuditSource);
            Assert.Equal(300, audit.ProductStockPerPanelId);

            // Verify the entry was actually saved to database
            var savedEntry = await _context.ProductWithdrawalEntries
                .Include(x => x.ProductStockAudits)
                .FirstOrDefaultAsync(x => x.WithdrawalSlipNo == "WS-TEST-001", cancellationToken);

            Assert.NotNull(savedEntry);
            Assert.Single(savedEntry.ProductStockAudits);
        }

        [Fact]
        public async Task UpdateProductWithdrawalEntries_WithExistingEntry_ShouldUpdateEntry()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;

            // Create an existing entry first
            var existingEntry = new ProductWithdrawalEntry
            {
                Id = 100,
                UserAccountId = 1,
                StockEntryDate = DateTime.Now.AddDays(-1),
                WithdrawalSlipNo = "WS-EXISTING-001",
                Notes = "Original notes",
                IsActive = true,
                IsDelete = false,
                ProductStockAudits = new List<ProductStockAudit>
                {
                    new ProductStockAudit
                    {
                        Id = 500,
                        ProductStockPerPanelId = 300,
                        Quantity = 5,
                        WarehouseId = 1,
                        StockAuditSource = StockAuditSourceEnum.FromWithdrawal,
                        IsActive = true,
                        IsDelete = false
                    }
                }
            };

            _context.ProductWithdrawalEntries.Add(existingEntry);
            await _context.SaveChangesAsync(cancellationToken);

            // Setup product repository mock
            _productRepositoryMock
                .Setup(x => x.ManageProductStockPerPanel(
                    It.IsAny<Product>(), 
                    It.IsAny<ProductInput>(), 
                    It.IsAny<int>(), 
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(new ProductStockPerPanel { Id = 300, ProductId = 200 });

            var inputs = new List<ProductWithdrawalEntryInput>
            {
                new ProductWithdrawalEntryInput
                {
                    Id = 100, // Existing entry
                    UserAccountId = 1,
                    StockEntryDate = DateTime.Now.ToString("yyyy-MM-dd"),
                    WithdrawalSlipNo = "WS-UPDATED-001",
                    Notes = "Updated notes",
                    ProductStockAuditsInputs = new List<ProductStockAuditInput>
                    {
                        new ProductStockAuditInput
                        {
                            Id = 500, // Existing audit
                            ProductId = 200,
                            ProductStockPerPanelId = 300,
                            Quantity = 15, // Updated quantity
                            WarehouseId = 1,
                            StockAuditSource = StockAuditSourceEnum.FromWithdrawal,
                            PricePerUnit = 15.0f
                        }
                    }
                }
            };

            // Act
            var result = await _repository.UpdateProductWithdrawalEntriesWithBusinessLogic(
                inputs,
                
                cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);

            var updatedEntry = result[0];
            Assert.Equal("WS-UPDATED-001", updatedEntry.WithdrawalSlipNo);
            Assert.Equal("Updated notes", updatedEntry.Notes);
            Assert.Single(updatedEntry.ProductStockAudits);

            var audit = updatedEntry.ProductStockAudits[0];
            Assert.Equal(15, audit.Quantity); // Verify quantity was updated

            // Verify the entry was actually updated in database
            var savedEntry = await _context.ProductWithdrawalEntries
                .Include(x => x.ProductStockAudits)
                .FirstOrDefaultAsync(x => x.Id == 100, cancellationToken);

            Assert.NotNull(savedEntry);
            Assert.Equal("WS-UPDATED-001", savedEntry.WithdrawalSlipNo);
            Assert.Equal("Updated notes", savedEntry.Notes);
        }

        [Fact]
        public async Task UpdateProductWithdrawalEntries_WithExistingEntryAndNewAudit_ShouldAddNewAuditEntry()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;

            // Create an existing entry first
            var existingEntry = new ProductWithdrawalEntry
            {
                Id = 101,
                UserAccountId = 1,
                StockEntryDate = DateTime.Now.AddDays(-1),
                WithdrawalSlipNo = "WS-EXISTING-002",
                Notes = "Original notes",
                IsActive = true,
                IsDelete = false,
                ProductStockAudits = new List<ProductStockAudit>
                {
                    new ProductStockAudit
                    {
                        Id = 501,
                        ProductStockPerPanelId = 300,
                        Quantity = 5,
                        WarehouseId = 1,
                        StockAuditSource = StockAuditSourceEnum.FromWithdrawal,
                        IsActive = true,
                        IsDelete = false
                    }
                }
            };

            _context.ProductWithdrawalEntries.Add(existingEntry);
            await _context.SaveChangesAsync(cancellationToken);

            // Setup product repository mock
            _productRepositoryMock
                .Setup(x => x.ManageProductStockPerPanel(
                    It.IsAny<Product>(), 
                    It.IsAny<ProductInput>(), 
                    It.IsAny<int>(), 
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(new ProductStockPerPanel { Id = 300, ProductId = 200 });

            var inputs = new List<ProductWithdrawalEntryInput>
            {
                new ProductWithdrawalEntryInput
                {
                    Id = 101, // Existing entry
                    UserAccountId = 1,
                    StockEntryDate = DateTime.Now.ToString("yyyy-MM-dd"),
                    WithdrawalSlipNo = "WS-EXISTING-002",
                    Notes = "Updated with new audit",
                    ProductStockAuditsInputs = new List<ProductStockAuditInput>
                    {
                        new ProductStockAuditInput
                        {
                            Id = 501, // Existing audit - keep this
                            ProductId = 200,
                            ProductStockPerPanelId = 300,
                            Quantity = 5,
                            WarehouseId = 1,
                            StockAuditSource = StockAuditSourceEnum.FromWithdrawal,
                            PricePerUnit = 15.0f
                        },
                        new ProductStockAuditInput
                        {
                            Id = 0, // New audit entry
                            ProductId = 200,
                            ProductStockPerPanelId = 300,
                            Quantity = 10,
                            WarehouseId = 1,
                            StockAuditSource = StockAuditSourceEnum.FromWithdrawal,
                            PricePerUnit = 15.0f
                        }
                    }
                }
            };

            // Act
            var result = await _repository.UpdateProductWithdrawalEntriesWithBusinessLogic(
                inputs,
                
                cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);

            var updatedEntry = result[0];
            Assert.Equal("WS-EXISTING-002", updatedEntry.WithdrawalSlipNo);
            Assert.Equal("Updated with new audit", updatedEntry.Notes);
            Assert.Equal(2, updatedEntry.ProductStockAudits.Count); // Should now have 2 audit entries

            // Verify the existing audit entry is still there
            var existingAudit = updatedEntry.ProductStockAudits.FirstOrDefault(a => a.Id == 501);
            Assert.NotNull(existingAudit);
            Assert.Equal(5, existingAudit.Quantity);

            // Verify the new audit entry was added (look for the one with quantity 10 that's not the existing one)
            var newAudit = updatedEntry.ProductStockAudits.FirstOrDefault(a => a.Quantity == 10 && a.Id != 501);
            Assert.NotNull(newAudit);
            Assert.Equal(10, newAudit.Quantity);
            Assert.Equal(300, newAudit.ProductStockPerPanelId);
            Assert.Equal(StockAuditSourceEnum.FromWithdrawal, newAudit.StockAuditSource);

            // Verify the changes were actually saved to database
            var savedEntry = await _context.ProductWithdrawalEntries
                .Include(x => x.ProductStockAudits)
                .FirstOrDefaultAsync(x => x.Id == 101, cancellationToken);

            Assert.NotNull(savedEntry);
            Assert.Equal(2, savedEntry.ProductStockAudits.Count);
            Assert.Equal("Updated with new audit", savedEntry.Notes);

            // Verify both audit entries exist in database
            var existingAuditInDb = savedEntry.ProductStockAudits.FirstOrDefault(a => a.Id == 501);
            var newAuditInDb = savedEntry.ProductStockAudits.FirstOrDefault(a => a.Quantity == 10 && a.Id != 501);
            
            Assert.NotNull(existingAuditInDb);
            Assert.NotNull(newAuditInDb);
            Assert.Equal(5, existingAuditInDb.Quantity);
            Assert.Equal(10, newAuditInDb.Quantity);
        }

        [Fact]
        public async Task UpdateProductWithdrawalEntries_WithCancelledToken_ShouldThrowOperationCanceledException()
        {
            // Arrange
            var cancellationTokenSource = new CancellationTokenSource();
            cancellationTokenSource.Cancel();
            var cancelledToken = cancellationTokenSource.Token;

            var inputs = new List<ProductWithdrawalEntryInput>
            {
                new ProductWithdrawalEntryInput
                {
                    Id = 0,
                    UserAccountId = 1,
                    StockEntryDate = DateTime.Now.ToString("yyyy-MM-dd"),
                    WithdrawalSlipNo = "WS-CANCELLED-001",
                    Notes = "Should not be saved",
                    ProductStockAuditsInputs = new List<ProductStockAuditInput>()
                }
            };

            // Act & Assert
            var exception = await Assert.ThrowsAnyAsync<OperationCanceledException>(async () =>
            {
                await _repository.UpdateProductWithdrawalEntriesWithBusinessLogic(
                    inputs,
                    
                    cancelledToken);
            });

            Assert.True(exception.CancellationToken.IsCancellationRequested);

            // Verify no entry was created in database
            var notSavedEntry = await _context.ProductWithdrawalEntries
                .FirstOrDefaultAsync(x => x.WithdrawalSlipNo == "WS-CANCELLED-001");

            Assert.Null(notSavedEntry);
        }

        [Fact]
        public async Task UpdateProductWithdrawalEntries_WithRemovedAuditEntry_ShouldRemoveAuditFromCollection()
        {
            // Arrange
            var cancellationToken = CancellationToken.None;

            // Create an existing entry with multiple audit entries
            var existingEntry = new ProductWithdrawalEntry
            {
                Id = 102,
                UserAccountId = 1,
                StockEntryDate = DateTime.Now.AddDays(-1),
                WithdrawalSlipNo = "WS-EXISTING-003",
                Notes = "Entry with multiple audits",
                IsActive = true,
                IsDelete = false,
                ProductStockAudits = new List<ProductStockAudit>
                {
                    new ProductStockAudit
                    {
                        Id = 502,
                        ProductStockPerPanelId = 300,
                        Quantity = 5,
                        WarehouseId = 1,
                        StockAuditSource = StockAuditSourceEnum.FromWithdrawal,
                        IsActive = true,
                        IsDelete = false
                    },
                    new ProductStockAudit
                    {
                        Id = 503,
                        ProductStockPerPanelId = 300,
                        Quantity = 8,
                        WarehouseId = 1,
                        StockAuditSource = StockAuditSourceEnum.FromWithdrawal,
                        IsActive = true,
                        IsDelete = false
                    }
                }
            };

            _context.ProductWithdrawalEntries.Add(existingEntry);
            await _context.SaveChangesAsync(cancellationToken);

            // Setup product repository mock
            _productRepositoryMock
                .Setup(x => x.ManageProductStockPerPanel(
                    It.IsAny<Product>(), 
                    It.IsAny<ProductInput>(), 
                    It.IsAny<int>(), 
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(new ProductStockPerPanel { Id = 300, ProductId = 200 });

            var inputs = new List<ProductWithdrawalEntryInput>
            {
                new ProductWithdrawalEntryInput
                {
                    Id = 102, // Existing entry
                    UserAccountId = 1,
                    StockEntryDate = DateTime.Now.ToString("yyyy-MM-dd"),
                    WithdrawalSlipNo = "WS-EXISTING-003",
                    Notes = "Updated with removed audit",
                    ProductStockAuditsInputs = new List<ProductStockAuditInput>
                    {
                        new ProductStockAuditInput
                        {
                            Id = 502, // Keep only the first audit entry
                            ProductId = 200,
                            ProductStockPerPanelId = 300,
                            Quantity = 5,
                            WarehouseId = 1,
                            StockAuditSource = StockAuditSourceEnum.FromWithdrawal,
                            PricePerUnit = 15.0f
                        }
                        // Note: audit with Id 503 is intentionally omitted, should be removed
                    }
                }
            };

            // Act
            var result = await _repository.UpdateProductWithdrawalEntriesWithBusinessLogic(
                inputs,
                
                cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);

            var updatedEntry = result[0];
            Assert.Equal("WS-EXISTING-003", updatedEntry.WithdrawalSlipNo);
            Assert.Equal("Updated with removed audit", updatedEntry.Notes);
            Assert.Single(updatedEntry.ProductStockAudits); // Should now have only 1 audit entry

            // Verify only the first audit entry remains
            var remainingAudit = updatedEntry.ProductStockAudits.FirstOrDefault();
            Assert.NotNull(remainingAudit);
            Assert.Equal(502, remainingAudit.Id);
            Assert.Equal(5, remainingAudit.Quantity);

            // Verify the second audit entry was removed
            var removedAudit = updatedEntry.ProductStockAudits.FirstOrDefault(a => a.Id == 503);
            Assert.Null(removedAudit);

            // Verify the changes were actually saved to database
            var savedEntry = await _context.ProductWithdrawalEntries
                .Include(x => x.ProductStockAudits)
                .FirstOrDefaultAsync(x => x.Id == 102, cancellationToken);

            Assert.NotNull(savedEntry);
            Assert.Single(savedEntry.ProductStockAudits); // Only one audit should remain in DB
            Assert.Equal("Updated with removed audit", savedEntry.Notes);

            // Verify only the correct audit exists in database
            var auditInDb = savedEntry.ProductStockAudits.FirstOrDefault();
            Assert.NotNull(auditInDb);
            Assert.Equal(502, auditInDb.Id);
            Assert.Equal(5, auditInDb.Quantity);
        }

        public void Dispose()
        {
            _connection?.Dispose();
            _context?.Dispose();
        }
    }
}
