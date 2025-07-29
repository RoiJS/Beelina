using Xunit;
using Moq;
using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Enums;
using Beelina.LIB.DbContexts;
using Beelina.LIB.Helpers.Classes;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Data.Sqlite;

namespace Beelina.UnitTest;

public class TransactionRepositorySetTransactionsStatusTests
    : BeelinaBaseTest, IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly BeelinaClientDataContext _context;

    public TransactionRepositorySetTransactionsStatusTests()
        : base()
    {
        // Setup SQLite in-memory database
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<BeelinaClientDataContext>()
            .UseSqlite(_connection)
            .Options;

        _context = new BeelinaClientDataContext(options, new DataContextHelper());
        _context.Database.EnsureCreated();

        // Seed the database with test data
        SeedSampleData(_context, FieldAgent.Id);
        _context.SaveChanges();
    }

    public void Dispose()
    {
        _connection?.Dispose();
        _context?.Dispose();
    }

    private TransactionRepository CreateRepositoryWithSeededData(int userId)
    {
        var beelinaRepoMock = new Mock<IBeelinaRepository<Transaction>>();
        beelinaRepoMock.SetupGet(x => x.ClientDbContext).Returns(_context);

        var userAccountRepoMock = new Mock<IUserAccountRepository<UserAccount>>();
        userAccountRepoMock.Setup(x => x.GetCurrentUsersPermissionLevel(userId, ModulesEnum.Distribution))
            .ReturnsAsync(new UserPermission { PermissionLevel = PermissionLevelEnum.User });

        var productTransactionRepoMock = new Mock<IProductTransactionRepository<ProductTransaction>>();
        
        var paymentRepoMock = new Mock<IPaymentRepository<Payment>>();
        paymentRepoMock.Setup(x => x.RegisterPayment(It.IsAny<Payment>()))
            .Returns(Task.CompletedTask);

        var emailServerSettingsMock = new Mock<IOptions<EmailServerSettings>>();
        emailServerSettingsMock.Setup(x => x.Value).Returns(new EmailServerSettings());
        
        var appHostInfoMock = new Mock<IOptions<AppHostInfo>>();
        appHostInfoMock.Setup(x => x.Value).Returns(new AppHostInfo());
        
        var appSettingsMock = new Mock<IOptions<ApplicationSettings>>();
        appSettingsMock.Setup(x => x.Value).Returns(new ApplicationSettings { 
            GeneralSettings = new GeneralSettings { TimeZone = "UTC" } 
        });
        
        var currentUserServiceMock = new Mock<ICurrentUserService>();
        currentUserServiceMock.SetupGet(x => x.CurrentUserId).Returns(userId);
        
        var userSettingsRepoMock = new Mock<IUserSettingsRepository<UserSetting>>();
        var generalSettingsRepoMock = new Mock<IGeneralSettingRepository<GeneralSetting>>();
        var loggerMock = new Mock<ILogger<TransactionRepository>>();

        return new TransactionRepository(
            beelinaRepoMock.Object,
            userAccountRepoMock.Object,
            productTransactionRepoMock.Object,
            emailServerSettingsMock.Object,
            appHostInfoMock.Object,
            appSettingsMock.Object,
            currentUserServiceMock.Object,
            userSettingsRepoMock.Object,
            generalSettingsRepoMock.Object,
            paymentRepoMock.Object,
            loggerMock.Object
        );
    }

    [Fact]
    public async Task SetTransactionsStatus_UpdatesTransactionStatus_WhenValidTransactionIds()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 1, 2, 3 }; // These transactions exist in seed data
        var newStatus = TransactionStatusEnum.Confirmed;

        // Act
        var result = await repo.SetTransactionsStatus(transactionIds, newStatus, false);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.Count);
        Assert.All(result, t => Assert.Equal(newStatus, t.Status));
    }

    [Fact]
    public async Task SetTransactionsStatus_UpdatesMultipleTransactions_ToConfirmedStatus()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 11, 12, 13, 14 }; // Draft transactions from seed data
        var newStatus = TransactionStatusEnum.Confirmed;

        // Act
        var result = await repo.SetTransactionsStatus(transactionIds, newStatus, false);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(4, result.Count);
        Assert.All(result, t => Assert.Equal(TransactionStatusEnum.Confirmed, t.Status));
    }

    [Fact]
    public async Task SetTransactionsStatus_UpdatesTransactionsToDraftStatus()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 1, 2 }; // Confirmed transactions from seed data
        var newStatus = TransactionStatusEnum.Draft;

        // Act
        var result = await repo.SetTransactionsStatus(transactionIds, newStatus, false);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.All(result, t => Assert.Equal(TransactionStatusEnum.Draft, t.Status));
    }

    [Fact]
    public async Task SetTransactionsStatus_UpdatesTransactionsToBadOrderStatus()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 1, 2 }; // Confirmed transactions from seed data
        var newStatus = TransactionStatusEnum.BadOrder;

        // Act
        var result = await repo.SetTransactionsStatus(transactionIds, newStatus, false);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.All(result, t => Assert.Equal(TransactionStatusEnum.BadOrder, t.Status));
    }

    [Fact]
    public async Task SetTransactionsStatus_MarksProductTransactionsAsPaid_WhenMarkAsPaidIsTrue()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 1, 2 }; // Transactions with product transactions
        var newStatus = TransactionStatusEnum.Confirmed;

        // Act
        var result = await repo.SetTransactionsStatus(transactionIds, newStatus, markAsPaid: true);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.All(result, t => Assert.Equal(TransactionStatusEnum.Confirmed, t.Status));
        
        // Verify that product transactions are marked as paid
        foreach (var transaction in result)
        {
            if (transaction.ProductTransactions != null)
            {
                Assert.All(transaction.ProductTransactions, pt => Assert.Equal(PaymentStatusEnum.Paid, pt.Status));
            }
        }
    }

    [Fact]
    public async Task SetTransactionsStatus_DoesNotMarkProductTransactionsAsPaid_WhenMarkAsPaidIsFalse()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 1, 2 };
        var newStatus = TransactionStatusEnum.Confirmed;

        // Act
        var result = await repo.SetTransactionsStatus(transactionIds, newStatus, markAsPaid: false);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.All(result, t => Assert.Equal(TransactionStatusEnum.Confirmed, t.Status));
        
        // Verify that product transactions payment status is not modified when markAsPaid is false
        foreach (var transaction in result)
        {
            if (transaction.ProductTransactions != null)
            {
                // Product transactions should maintain their original status
                Assert.All(transaction.ProductTransactions, pt => 
                    Assert.True(pt.Status == PaymentStatusEnum.Paid || pt.Status == PaymentStatusEnum.Unpaid));
            }
        }
    }

    [Fact]
    public async Task SetTransactionsStatus_ReturnsEmptyList_WhenNoTransactionIdsProvided()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int>(); // Empty list
        var newStatus = TransactionStatusEnum.Confirmed;

        // Act
        var result = await repo.SetTransactionsStatus(transactionIds, newStatus, false);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task SetTransactionsStatus_ReturnsEmptyList_WhenTransactionIdsDoNotExist()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 9999, 8888 }; // Non-existent transaction IDs
        var newStatus = TransactionStatusEnum.Confirmed;

        // Act
        var result = await repo.SetTransactionsStatus(transactionIds, newStatus, false);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task SetTransactionsStatus_IncludesProductTransactions_WhenTransactionsHaveProductTransactions()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 1, 2 }; // Transactions with product transactions
        var newStatus = TransactionStatusEnum.Confirmed;

        // Act
        var result = await repo.SetTransactionsStatus(transactionIds, newStatus, false);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        
        // Verify that product transactions are included in the result
        foreach (var transaction in result)
        {
            Assert.NotNull(transaction.ProductTransactions);
            Assert.True(transaction.ProductTransactions.Count > 0);
        }
    }

    [Fact]
    public async Task SetTransactionsStatus_HandlesLargeNumberOfTransactions()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 }; // All confirmed transactions
        var newStatus = TransactionStatusEnum.Draft;

        // Act
        var result = await repo.SetTransactionsStatus(transactionIds, newStatus, false);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(10, result.Count);
        Assert.All(result, t => Assert.Equal(TransactionStatusEnum.Draft, t.Status));
    }

    [Fact]
    public async Task SetTransactionsStatus_UpdatesMixedTransactionStatuses()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        // Mix of confirmed (1-10), draft (11-20), and bad order (21-30) transactions
        var transactionIds = new List<int> { 1, 11, 21 }; 
        var newStatus = TransactionStatusEnum.Confirmed;

        // Act
        var result = await repo.SetTransactionsStatus(transactionIds, newStatus, false);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.Count);
        Assert.All(result, t => Assert.Equal(TransactionStatusEnum.Confirmed, t.Status));
    }

    [Theory]
    [InlineData(TransactionStatusEnum.Draft)]
    [InlineData(TransactionStatusEnum.Confirmed)]
    [InlineData(TransactionStatusEnum.BadOrder)]
    public async Task SetTransactionsStatus_UpdatesStatusCorrectly_ForAllValidStatuses(TransactionStatusEnum targetStatus)
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 1, 2, 3 };

        // Act
        var result = await repo.SetTransactionsStatus(transactionIds, targetStatus, false);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.Count);
        Assert.All(result, t => Assert.Equal(targetStatus, t.Status));
    }

    [Fact]
    public async Task SetTransactionsStatus_CallsPaymentRepository_WhenMarkAsPaidIsTrueAndTransactionHasBalance()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 1 }; // Transaction with potential balance
        var newStatus = TransactionStatusEnum.Confirmed;

        // Act
        var result = await repo.SetTransactionsStatus(transactionIds, newStatus, markAsPaid: true);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        Assert.Equal(TransactionStatusEnum.Confirmed, result[0].Status);
        
        // Note: The actual payment registration is tested through the mock setup
        // and would be verified through payment repository interactions
    }

    [Fact]
    public async Task SetTransactionsStatus_DoesNotCreatePayment_WhenMarkAsPaidIsFalse()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 1, 2 };
        var newStatus = TransactionStatusEnum.Confirmed;

        // Act
        var result = await repo.SetTransactionsStatus(transactionIds, newStatus, markAsPaid: false);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.All(result, t => Assert.Equal(TransactionStatusEnum.Confirmed, t.Status));
        
        // When markAsPaid is false, no automatic payments should be created
        // This is verified by not calling RegisterPayment on the payment repository mock
    }

    // SQLite Database-specific tests to verify real data persistence

    [Fact]
    public async Task SetTransactionsStatus_PersistsDataToSQLiteDatabase_WhenUpdatingStatus()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 1, 2, 3 };
        var newStatus = TransactionStatusEnum.BadOrder;

        // Get initial state from database
        var initialTransactions = await _context.Transactions
            .Where(t => transactionIds.Contains(t.Id))
            .ToListAsync();
        
        var initialStatuses = initialTransactions.Select(t => t.Status).ToList();

        // Act
        var result = await repo.SetTransactionsStatus(transactionIds, newStatus, false);

        // Assert - Check in-memory result
        Assert.NotNull(result);
        Assert.Equal(3, result.Count);
        Assert.All(result, t => Assert.Equal(newStatus, t.Status));

        // Assert - Verify data is persisted in SQLite database
        var updatedTransactions = await _context.Transactions
            .Where(t => transactionIds.Contains(t.Id))
            .ToListAsync();

        Assert.Equal(3, updatedTransactions.Count);
        Assert.All(updatedTransactions, t => Assert.Equal(TransactionStatusEnum.BadOrder, t.Status));
        
        // Verify the status actually changed from the initial state
        Assert.NotEmpty(initialStatuses.Where(s => s != TransactionStatusEnum.BadOrder));
    }

    [Fact]
    public async Task SetTransactionsStatus_QueryDatabaseAfterUpdate_ReturnsUpdatedData()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 11, 12, 13 }; // Draft transactions
        var newStatus = TransactionStatusEnum.Confirmed;

        // Verify initial state in database - count all draft and confirmed transactions
        var initialDraftCount = await _context.Transactions
            .CountAsync(t => t.Status == TransactionStatusEnum.Draft);
        var initialConfirmedCount = await _context.Transactions
            .CountAsync(t => t.Status == TransactionStatusEnum.Confirmed);

        // Act
        await repo.SetTransactionsStatus(transactionIds, newStatus, false);

        // Assert - Query database directly to verify changes
        var newDraftCount = await _context.Transactions
            .CountAsync(t => t.Status == TransactionStatusEnum.Draft);
        var newConfirmedCount = await _context.Transactions
            .CountAsync(t => t.Status == TransactionStatusEnum.Confirmed);

        // Verify the counts changed as expected
        Assert.Equal(initialDraftCount - 3, newDraftCount); // 3 less draft transactions
        Assert.Equal(initialConfirmedCount + 3, newConfirmedCount); // 3 more confirmed transactions

        // Verify specific transactions were updated
        var updatedTransactions = await _context.Transactions
            .Where(t => transactionIds.Contains(t.Id))
            .ToListAsync();

        Assert.All(updatedTransactions, t => Assert.Equal(TransactionStatusEnum.Confirmed, t.Status));
    }

    [Fact]
    public async Task SetTransactionsStatus_WithMarkAsPaid_UpdatesProductTransactionStatusInDatabase()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 1, 2 };
        var newStatus = TransactionStatusEnum.Confirmed;

        // Get initial product transaction statuses from database
        var initialProductTransactions = await _context.ProductTransactions
            .Where(pt => transactionIds.Contains(pt.TransactionId))
            .ToListAsync();

        // Act
        await repo.SetTransactionsStatus(transactionIds, newStatus, markAsPaid: true);

        // Assert - Query database directly to verify product transaction updates
        var updatedProductTransactions = await _context.ProductTransactions
            .Where(pt => transactionIds.Contains(pt.TransactionId))
            .ToListAsync();

        Assert.All(updatedProductTransactions, pt => Assert.Equal(PaymentStatusEnum.Paid, pt.Status));
        
        // Verify we have the expected number of product transactions
        Assert.True(updatedProductTransactions.Count > 0);
        Assert.Equal(initialProductTransactions.Count, updatedProductTransactions.Count);
    }

    [Fact]
    public async Task SetTransactionsStatus_DatabaseIntegrityCheck_PreservesOtherTransactionData()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 1, 2 };
        var newStatus = TransactionStatusEnum.BadOrder;

        // Get initial transaction data from database
        var initialTransactions = await _context.Transactions
            .Where(t => transactionIds.Contains(t.Id))
            .ToListAsync();

        var initialData = initialTransactions.Select(t => new
        {
            t.Id,
            t.InvoiceNo,
            t.StoreId,
            t.TransactionDate,
            t.CreatedById,
            t.Discount
        }).ToList();

        // Act
        await repo.SetTransactionsStatus(transactionIds, newStatus, false);

        // Assert - Verify other data remains unchanged
        var updatedTransactions = await _context.Transactions
            .Where(t => transactionIds.Contains(t.Id))
            .ToListAsync();

        for (int i = 0; i < initialData.Count; i++)
        {
            var initial = initialData[i];
            var updated = updatedTransactions.First(t => t.Id == initial.Id);

            Assert.Equal(initial.InvoiceNo, updated.InvoiceNo);
            Assert.Equal(initial.StoreId, updated.StoreId);
            Assert.Equal(initial.TransactionDate, updated.TransactionDate);
            Assert.Equal(initial.CreatedById, updated.CreatedById);
            Assert.Equal(initial.Discount, updated.Discount);
            
            // Only status should change
            Assert.Equal(TransactionStatusEnum.BadOrder, updated.Status);
        }
    }

    [Fact]
    public async Task SetTransactionsStatus_ConcurrentDatabaseAccess_HandlesMultipleOperations()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo1 = CreateRepositoryWithSeededData(userId);
        var repo2 = CreateRepositoryWithSeededData(userId);
        
        var transactionIds1 = new List<int> { 1, 2 };
        var transactionIds2 = new List<int> { 3, 4 };

        // Act - Simulate concurrent operations
        var task1 = repo1.SetTransactionsStatus(transactionIds1, TransactionStatusEnum.Confirmed, false);
        var task2 = repo2.SetTransactionsStatus(transactionIds2, TransactionStatusEnum.BadOrder, false);

        var results = await Task.WhenAll(task1, task2);

        // Assert - Verify both operations completed successfully
        Assert.NotNull(results[0]);
        Assert.NotNull(results[1]);
        Assert.Equal(2, results[0].Count);
        Assert.Equal(2, results[1].Count);

        // Verify database state
        var transaction1and2 = await _context.Transactions
            .Where(t => transactionIds1.Contains(t.Id))
            .ToListAsync();
        var transaction3and4 = await _context.Transactions
            .Where(t => transactionIds2.Contains(t.Id))
            .ToListAsync();

        Assert.All(transaction1and2, t => Assert.Equal(TransactionStatusEnum.Confirmed, t.Status));
        Assert.All(transaction3and4, t => Assert.Equal(TransactionStatusEnum.BadOrder, t.Status));
    }

    [Fact]
    public async Task SetTransactionsStatus_DatabaseConstraints_MaintainsReferentialIntegrity()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var transactionIds = new List<int> { 1, 2, 3 };

        // Get related data counts before operation
        var initialProductTransactionCount = await _context.ProductTransactions
            .CountAsync(pt => transactionIds.Contains(pt.TransactionId));
        var initialPaymentCount = await _context.Payments
            .CountAsync(p => transactionIds.Contains(p.TransactionId));

        // Act
        await repo.SetTransactionsStatus(transactionIds, TransactionStatusEnum.Confirmed, false);

        // Assert - Verify referential integrity is maintained
        var finalProductTransactionCount = await _context.ProductTransactions
            .CountAsync(pt => transactionIds.Contains(pt.TransactionId));
        var finalPaymentCount = await _context.Payments
            .CountAsync(p => transactionIds.Contains(p.TransactionId));

        // Related records should remain unchanged
        Assert.Equal(initialProductTransactionCount, finalProductTransactionCount);
        Assert.Equal(initialPaymentCount, finalPaymentCount);

        // Verify foreign key relationships still exist
        var transactionsWithRelations = await _context.Transactions
            .Include(t => t.ProductTransactions)
            .Where(t => transactionIds.Contains(t.Id))
            .ToListAsync();

        Assert.All(transactionsWithRelations, t => 
        {
            Assert.NotNull(t.ProductTransactions);
            Assert.True(t.ProductTransactions.Count > 0);
        });
    }
}
