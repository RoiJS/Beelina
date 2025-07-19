using Beelina.LIB.BusinessLogic;
using Beelina.LIB.DbContexts;
using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Beelina.UnitTest
{
    public class ProductRepository_SalesAgent_PanelWarehouseMonitoringHybridModelTests : BeelinaBaseTest
    {
        private readonly Mock<IBeelinaRepository<Product>> _beelinaRepositoryMock;
        private readonly Mock<ILogger<ProductRepository>> _loggerMock;
        private readonly Mock<IProductStockPerPanelRepository<ProductStockPerPanel>> _productStockPerPanelRepositoryMock;
        private readonly Mock<IProductStockPerWarehouseRepository<ProductStockPerWarehouse>> _productStockPerWarehouseRepositoryMock;
        private readonly Mock<IProductUnitRepository<ProductUnit>> _productUnitRepositoryMock;
        private readonly Mock<IUserAccountRepository<UserAccount>> _userAccountRepositoryMock;
        private readonly Mock<ISubscriptionRepository<ClientSubscription>> _subscriptionRepositoryMock;
        private readonly Mock<ICurrentUserService> _currentUserServiceMock;
        private readonly ProductRepository _productRepository;

        public ProductRepository_SalesAgent_PanelWarehouseMonitoringHybridModelTests() : base()
        {
            _beelinaRepositoryMock = new Mock<IBeelinaRepository<Product>>();
            _loggerMock = new Mock<ILogger<ProductRepository>>();
            _productStockPerPanelRepositoryMock = new Mock<IProductStockPerPanelRepository<ProductStockPerPanel>>();
            _productStockPerWarehouseRepositoryMock = new Mock<IProductStockPerWarehouseRepository<ProductStockPerWarehouse>>();
            _productUnitRepositoryMock = new Mock<IProductUnitRepository<ProductUnit>>();
            _userAccountRepositoryMock = new Mock<IUserAccountRepository<UserAccount>>();
            _subscriptionRepositoryMock = new Mock<ISubscriptionRepository<ClientSubscription>>();
            _currentUserServiceMock = new Mock<ICurrentUserService>();

            // Setup DbContext and DbSets
            var options = new DbContextOptionsBuilder<BeelinaClientDataContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var dbContext = new BeelinaClientDataContext(options, new DataContextHelper());

            _beelinaRepositoryMock.SetupGet(r => r.ClientDbContext).Returns(dbContext);

            _productRepository = new ProductRepository(
                _beelinaRepositoryMock.Object,
                _loggerMock.Object,
                _productStockPerPanelRepositoryMock.Object,
                _productStockPerWarehouseRepositoryMock.Object,
                _productUnitRepositoryMock.Object,
                _userAccountRepositoryMock.Object,
                _subscriptionRepositoryMock.Object,
                _currentUserServiceMock.Object
            );
        }

        private void SetupCommonWarehousePanelMonitoringTestData(
            int userId,
            PermissionLevelEnum permissionLevel = PermissionLevelEnum.User,
            SalesAgentTypeEnum salesAgentType = SalesAgentTypeEnum.FieldAgent,
            BusinessModelEnum businessModel = BusinessModelEnum.WarehouseMonitoring,
            CancellationToken cancellationToken = default)
        {
            _productRepository.SetCurrentUserId(userId);

            // Set up GeneralSetting with BusinessModelEnum.WarehouseMonitoring
            var generalSetting = new GeneralSetting { BusinessModel = businessModel };
            _beelinaRepositoryMock.Object.ClientDbContext.GeneralSettings.Add(generalSetting);

            // Use the new TestDataSeeder for all relevant seed data
            SeedSampleData(_beelinaRepositoryMock.Object.ClientDbContext, userId);

            // Set up UserPermission 
            _userAccountRepositoryMock
                .Setup(r => r.GetCurrentUsersPermissionLevel(It.IsAny<int>(), ModulesEnum.Distribution))
                .ReturnsAsync(new UserPermission { PermissionLevel = permissionLevel });

            // Set up UserAccount 
            _userAccountRepositoryMock
                .Setup(r => r.GetUserAccounts(userId, "", cancellationToken))
                .ReturnsAsync([new UserAccount { SalesAgentType = salesAgentType }]);
        }

        [Theory]
        [InlineData(2, SalesAgentTypeEnum.FieldAgent, 30)]
        [InlineData(3, SalesAgentTypeEnum.WarehouseAgent, 30)]
        public async Task GetProducts_NoProductFilter(int userId, SalesAgentTypeEnum salesAgentType, int productCount)
        {
            // Arrange
            // var userId = FieldAgent.Id;
            var productId = 0;
            var filterKeyWord = "";
            var cancellationToken = CancellationToken.None;

            SetupCommonWarehousePanelMonitoringTestData(userId, PermissionLevelEnum.User, salesAgentType, BusinessModelEnum.WarehousePanelHybridMonitoring, cancellationToken);

            // Act
            var result = await _productRepository.GetProducts(userId, productId, filterKeyWord, null, cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(productCount, result.Count);
            Assert.Contains(result, p => p.Name == "Product 1 - Supplier 1");
            Assert.Contains(result, p => p.Name == "Product 15 - Supplier 1");
            Assert.Contains(result, p => p.Name == "Product 1 - Supplier 2");
            Assert.Contains(result, p => p.Name == "Product 15 - Supplier 2");
        }


        [Theory]

        // Product linked to a Transaction
        [InlineData(2, 9, SalesAgentTypeEnum.FieldAgent, "Product 9 - Supplier 1", 491)]

        // Product linked to a Transaction with withdrawal as well
        [InlineData(3, 9, SalesAgentTypeEnum.WarehouseAgent, "Product 9 - Supplier 1", 295)]
        public async Task GetProduct_WithFilteredByProductId(
            int userId,
            int productId,
            SalesAgentTypeEnum salesAgentType,
            string productName,
            int stockQuantity
        )
        {
            // Arrange
            var filterKeyWord = "";
            var cancellationToken = CancellationToken.None;

            SetupCommonWarehousePanelMonitoringTestData(userId, PermissionLevelEnum.User, salesAgentType, BusinessModelEnum.WarehousePanelHybridMonitoring, cancellationToken);

            // Act
            var result = await _productRepository.GetProducts(userId, productId, filterKeyWord, null, cancellationToken);

            // Assert
            Assert.NotNull(result);
            // Only one product should match all filters
            Assert.Single(result);
            Assert.Equal(productName, result[0].Name);
            Assert.Equal(productId, result[0].Id);
            Assert.Equal(stockQuantity, result[0].StockQuantity);
        }
    }
}

