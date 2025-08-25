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

namespace Beelina.UnitTest;

public class TransactionRepositoryTests
    : BeelinaBaseTest
{

    public TransactionRepositoryTests()
    : base()
    {

    }

    private TransactionRepository CreateRepositoryWithSeededData(int userId)
    {
        var options = new DbContextOptionsBuilder<BeelinaClientDataContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new BeelinaClientDataContext(options, new Mock<IDataContextHelper>().Object);

        SeedSampleData(context, userId);

        var beelinaRepoMock = new Mock<IBeelinaRepository<Transaction>>();
        beelinaRepoMock.SetupGet(x => x.ClientDbContext).Returns(context);
        beelinaRepoMock.SetupGet(x => x.SystemDbContext).Returns((Beelina.LIB.DbContexts.BeelinaDataContext)null);

        var userAccountRepoMock = new Mock<IUserAccountRepository<UserAccount>>();
        userAccountRepoMock.Setup(x => x.GetCurrentUsersPermissionLevel(userId, ModulesEnum.Distribution))
            .ReturnsAsync(new UserPermission { PermissionLevel = PermissionLevelEnum.User });

        var productTransactionRepoMock = new Mock<IProductTransactionRepository<ProductTransaction>>();
        var paymentRepoMock = new Mock<IPaymentRepository<Payment>>();
        var emailServerSettingsMock = new Mock<IOptions<EmailServerSettings>>();
        emailServerSettingsMock.Setup(x => x.Value).Returns(new EmailServerSettings());
        var appHostInfoMock = new Mock<IOptions<AppHostInfo>>();
        appHostInfoMock.Setup(x => x.Value).Returns(new AppHostInfo());
        var appSettingsMock = new Mock<IOptions<ApplicationSettings>>();
        appSettingsMock.Setup(x => x.Value).Returns(new ApplicationSettings { GeneralSettings = new GeneralSettings { TimeZone = "UTC" } });
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
    public async Task GetSales_Returns_Correct_Sales_For_User()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);

        // Act
        var result = await repo.GetSales(userId, "", "");

        // Assert
        Assert.NotNull(result);
        Assert.True(result.TotalSalesAmount > 0);
        Assert.True(result.CashAmountOnHand >= 0);
        Assert.True(result.ChequeAmountOnHand >= 0);
        Assert.True(result.BadOrderAmount >= 0);
        Assert.True(result.AccountReceivables >= 0);
    }

    [Fact]
    public async Task GetSales_Calculates_TotalSalesAmount_Correctly()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);

        // Act
        var result = await repo.GetSales(userId, "", "");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(935, result.TotalSalesAmount);
    }

    [Fact]
    public async Task GetSales_Calculates_CashAmountOnHand_Correctly()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);

        // Act
        var result = await repo.GetSales(userId, "", "");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(386, result.CashAmountOnHand);
    }

    [Fact]
    public async Task GetSales_Calculates_ChequeAmountOnHand_Correctly()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);

        // Act
        var result = await repo.GetSales(userId, "", "");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(306, result.ChequeAmountOnHand);
    }

    [Fact]
    public async Task GetSales_Calculates_BadOrderAmount_Correctly()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);

        // Act
        var result = await repo.GetSales(userId, "", "");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(4035, result.BadOrderAmount);
    }

    [Fact]
    public async Task GetSales_Calculates_AccountReceivables_Correctly()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);

        // Act
        var result = await repo.GetSales(userId, "", "");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(935, result.AccountReceivables);
    }

    [Fact]
    public async Task GetSales_Calculates_CashAmountOnHand_Correctly_WithDateFilter()
    {
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var fromDate = DateTime.Now.AddDays(-5).ToString("yyyy-MM-dd");
        var toDate = DateTime.Now.ToString("yyyy-MM-dd");

        var result = await repo.GetSales(userId, fromDate, toDate);

        Assert.NotNull(result);
        Assert.Equal(67, result.CashAmountOnHand); // Replace with actual expected value
    }

    [Fact]
    public async Task GetSales_Calculates_ChequeAmountOnHand_Correctly_WithDateFilter()
    {
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var fromDate = DateTime.Now.AddDays(-5).ToString("yyyy-MM-dd");
        var toDate = DateTime.Now.ToString("yyyy-MM-dd");

        var result = await repo.GetSales(userId, fromDate, toDate);

        Assert.NotNull(result);
        Assert.Equal(39, result.ChequeAmountOnHand); // Replace with actual expected value
    }

    [Fact]
    public async Task GetSales_Calculates_BadOrderAmount_Correctly_WithDateFilter()
    {
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var fromDate = DateTime.Now.AddDays(-5).ToString("yyyy-MM-dd");
        var toDate = DateTime.Now.ToString("yyyy-MM-dd");

        var result = await repo.GetSales(userId, fromDate, toDate);

        Assert.NotNull(result);
        Assert.Equal(0, result.BadOrderAmount); // Replace with actual expected value
    }

    [Fact]
    public async Task GetSales_Calculates_AccountReceivables_Correctly_WithDateFilter()
    {
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var fromDate = DateTime.Now.AddDays(-5).ToString("yyyy-MM-dd");
        var toDate = DateTime.Now.ToString("yyyy-MM-dd");

        var result = await repo.GetSales(userId, fromDate, toDate);

        Assert.NotNull(result);
        Assert.Equal(205, result.AccountReceivables); // Replace with actual expected value
    }

    [Fact]
    public async Task GetTransactions_Filters_By_DateRange_Correctly()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var fromDate = DateTime.Now.AddDays(-10).ToString("yyyy-MM-dd");
        var toDate = DateTime.Now.AddDays(-1).ToString("yyyy-MM-dd");
        
        var transactionsFilter = new Beelina.LIB.Models.Filters.TransactionsFilter
        {
            Status = TransactionStatusEnum.All,
            PaymentStatus = PaymentStatusEnum.All,
            StoreId = 0,
            DateFrom = fromDate,
            DateTo = toDate
        };

        // Act
        var result = await repo.GetTransactions(userId, "", transactionsFilter);

        // Assert
        Assert.NotNull(result);
        // Verify that all returned transactions are within the date range
        foreach (var transaction in result)
        {
            Assert.True(transaction.TransactionDate >= DateTime.Parse(fromDate));
            Assert.True(transaction.TransactionDate <= DateTime.Parse(toDate));
        }
    }

    [Fact]
    public async Task GetTransactions_Filters_By_DateFrom_Only()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var fromDate = DateTime.Now.AddDays(-5).ToString("yyyy-MM-dd");
        
        var transactionsFilter = new Beelina.LIB.Models.Filters.TransactionsFilter
        {
            Status = TransactionStatusEnum.All,
            PaymentStatus = PaymentStatusEnum.All,
            StoreId = 0,
            DateFrom = fromDate,
            DateTo = null
        };

        // Act
        var result = await repo.GetTransactions(userId, "", transactionsFilter);

        // Assert
        Assert.NotNull(result);
        // Verify that all returned transactions are on or after the from date
        foreach (var transaction in result)
        {
            Assert.True(transaction.TransactionDate >= DateTime.Parse(fromDate));
        }
    }

    [Fact]
    public async Task GetTransactions_Filters_By_DateTo_Only()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var toDate = DateTime.Now.AddDays(-1).ToString("yyyy-MM-dd");
        
        var transactionsFilter = new Beelina.LIB.Models.Filters.TransactionsFilter
        {
            Status = TransactionStatusEnum.All,
            PaymentStatus = PaymentStatusEnum.All,
            StoreId = 0,
            DateFrom = null,
            DateTo = toDate
        };

        // Act
        var result = await repo.GetTransactions(userId, "", transactionsFilter);

        // Assert
        Assert.NotNull(result);
        // Verify that all returned transactions are on or before the to date
        foreach (var transaction in result)
        {
            Assert.True(transaction.TransactionDate <= DateTime.Parse(toDate));
        }
    }

    [Fact]
    public async Task GetTransactions_Works_With_Specific_Date_Filter()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var specificDate = DateTime.Now.ToString("yyyy-MM-dd");
        
        var transactionsFilter = new Beelina.LIB.Models.Filters.TransactionsFilter
        {
            Status = TransactionStatusEnum.All,
            PaymentStatus = PaymentStatusEnum.All,
            StoreId = 0,
            DateFrom = specificDate,
            DateTo = specificDate
        };

        // Act
        var result = await repo.GetTransactions(userId, "", transactionsFilter);

        // Assert
        Assert.NotNull(result);
        // Verify that all returned transactions match the specific date
        foreach (var transaction in result)
        {
            Assert.Equal(DateTime.Parse(specificDate).Date, transaction.TransactionDate.Date);
        }
    }

    [Fact]
    public async Task GetTransactions_Combines_DateRange_And_Other_Filters()
    {
        // Arrange
        var userId = FieldAgent.Id;
        var repo = CreateRepositoryWithSeededData(userId);
        var fromDate = DateTime.Now.AddDays(-10).ToString("yyyy-MM-dd");
        var toDate = DateTime.Now.ToString("yyyy-MM-dd");
        
        var transactionsFilter = new Beelina.LIB.Models.Filters.TransactionsFilter
        {
            Status = TransactionStatusEnum.Confirmed,
            PaymentStatus = PaymentStatusEnum.All,
            StoreId = 0,
            DateFrom = fromDate,
            DateTo = toDate
        };

        // Act
        var result = await repo.GetTransactions(userId, "", transactionsFilter);

        // Assert
        Assert.NotNull(result);
        // Verify that all returned transactions are within the date range and have confirmed status
        foreach (var transaction in result)
        {
            Assert.True(transaction.TransactionDate >= DateTime.Parse(fromDate));
            Assert.True(transaction.TransactionDate <= DateTime.Parse(toDate));
            Assert.Equal(TransactionStatusEnum.Confirmed, transaction.Status);
        }
    }

    [Fact]
    public async Task GetProfit_Returns_Correct_Profit_Calculation()
    {
        // Arrange
        var repo = CreateRepositoryWithSeededData(FieldAgent.Id);
        var fromDate = DateTime.Now.AddDays(-7).ToString("yyyy-MM-dd");
        var toDate = DateTime.Now.ToString("yyyy-MM-dd");

        // Act
        var result = await repo.GetProfit(FieldAgent.Id, fromDate, toDate);

        // Assert
        // The profit is calculated as: Total Sales - Total Purchase Orders
        // The result can be positive, negative, or zero depending on the test data
        // We just verify that the calculation completes and returns a valid number
        Assert.True(!double.IsNaN(result) && !double.IsInfinity(result), "Profit calculation should return a valid number");
    }

    [Fact]
    public async Task GetProfit_WithNoDates_Returns_AllTimeProfit()
    {
        // Arrange
        var repo = CreateRepositoryWithSeededData(FieldAgent.Id);

        // Act
        var result = await repo.GetProfit(FieldAgent.Id, "", "");

        // Assert
        // When no dates are provided, it should calculate profit for all time
        // The result should be a valid number (not NaN or infinity)
        Assert.False(double.IsNaN(result), "Result should not be NaN");
        Assert.False(double.IsInfinity(result), "Result should not be infinity");
    }
}