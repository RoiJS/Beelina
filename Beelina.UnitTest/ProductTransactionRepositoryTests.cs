using Xunit;
using Moq;
using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Enums;
using Microsoft.EntityFrameworkCore;
using Beelina.LIB.DbContexts;
using Beelina.UnitTest;

namespace Beelina.UnitTest
{
    public class ProductTransactionRepositoryTests : BeelinaBaseTest
    {
        public ProductTransactionRepositoryTests()
            : base()
        {

        }

        private ProductTransactionRepository CreateRepositoryWithSeededData(
            int userId,
            PermissionLevelEnum permissionLevelEnum,
            string dbName)
        {
            var permissionLevel = new UserPermission { PermissionLevel = permissionLevelEnum };

            var userAccountRepoMock = new Mock<IUserAccountRepository<UserAccount>>();
            userAccountRepoMock
                .Setup(x => x.GetCurrentUsersPermissionLevel(userId, ModulesEnum.Distribution))
                .ReturnsAsync(permissionLevel);

            var options = new DbContextOptionsBuilder<BeelinaClientDataContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            var context = new BeelinaClientDataContext(options, new DataContextHelper());
            SeedSampleData(context, userId);

            var beelinaRepoMock = new Mock<IBeelinaRepository<ProductTransaction>>();
            beelinaRepoMock.SetupGet(x => x.ClientDbContext).Returns(context);
            var currentUserServiceMock = new Mock<ICurrentUserService>();

            return new ProductTransactionRepository(
                beelinaRepoMock.Object,
                currentUserServiceMock.Object,
                userAccountRepoMock.Object
            );
        }

        [Fact]
        public async Task GetTopSellingProducts_Returns_Correct_Top_Products()
        {
            // Arrange
            var userId = FieldAgent.Id;
            var repo = CreateRepositoryWithSeededData(userId, PermissionLevelEnum.User, "BeelinaTestDb");

            // Act
            var result = await repo.GetTopSellingProducts(userId);

            // Assert
            Assert.Equal(10, result.Count); // 10 products
            var topProduct = result.OrderByDescending(p => p.TotalAmount).First();
            Assert.NotNull(topProduct);
            Assert.True(topProduct.TotalAmount > 0);
        }

        [Fact]
        public async Task GetTopSellingProducts_Returns_Correct_Top_Products_For_Administrator()
        {
            // Arrange
            var userId = FieldAgent.Id;
            var repo = CreateRepositoryWithSeededData(userId, PermissionLevelEnum.Administrator, "BeelinaTestDb_Admin");

            // Act
            var result = await repo.GetTopSellingProducts(userId);

            // Assert
            Assert.Equal(10, result.Count); // 10 products
            Assert.All(result, p => Assert.True(p.TotalAmount > 0));
        }

        [Fact]
        public async Task GetTopSellingProducts_Returns_Correct_Top_Products_For_Manager()
        {
            // Arrange
            var userId = FieldAgent.Id;
            var repo = CreateRepositoryWithSeededData(userId, PermissionLevelEnum.Manager, "BeelinaTestDb_Manager");

            // Act
            var result = await repo.GetTopSellingProducts(userId);

            // Assert
            Assert.Equal(10, result.Count); // 10 products
            Assert.All(result, p => Assert.True(p.TotalAmount > 0));
        }

        [Fact]
        public async Task GetTopSellingProducts_Filters_By_Date_Range()
        {
            // Arrange
            var userId = FieldAgent.Id;
            var repo = CreateRepositoryWithSeededData(userId, PermissionLevelEnum.Administrator, "BeelinaTestDb_DateFilter");

            // Only include transactions from 5 days ago to 2 days ago
            var fromDate = System.DateTime.Now.AddDays(-5).ToString("yyyy-MM-dd");
            var toDate = System.DateTime.Now.AddDays(-2).ToString("yyyy-MM-dd");

            // Act
            var result = await repo.GetTopSellingProducts(userId, fromDate, toDate);

            // Assert
            // Only transactions with TransactionDate between fromDate and toDate should be included
            // In our seed, Confirmed transactions have TransactionDate from -1 to -10 days ago
            // So this should include transactions with Id 2 to 5 (since AddDays(-2) to AddDays(-5))
            var expectedTransactionIds = Enumerable.Range(2, 4).ToList();
            var expectedProductIds = expectedTransactionIds.Select(i => ((i - 1) % 10) + 1).Distinct().ToList();
            Assert.Equal(expectedProductIds.Count, result.Count);
            Assert.All(result, p => Assert.Contains(p.Id, expectedProductIds));
        }
    }

}
