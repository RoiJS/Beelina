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
    public class ProductRepository_Administrator_PanelWarehouseMonitoringModelTests : BeelinaBaseTest
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

        public ProductRepository_Administrator_PanelWarehouseMonitoringModelTests() : base()
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
            int userId)
        {
            // Set up GeneralSetting with BusinessModelEnum.WarehousePanelMonitoring
            var generalSetting = new GeneralSetting { BusinessModel = BusinessModelEnum.WarehousePanelMonitoring };
            _beelinaRepositoryMock.Object.ClientDbContext.GeneralSettings.Add(generalSetting);

            // Use the new TestDataSeeder for all relevant seed data
            SeedSampleData(_beelinaRepositoryMock.Object.ClientDbContext, userId);
        }

        [Fact]
        public async Task GetWarehouseProduct_NoProductFilter()
        {
            // Arrange
            var userId = AdminAccount.Id;
            var warehouseId = 1;
            var productId = 0;
            var filterKeyWord = "";
            var cancellationToken = CancellationToken.None;

            SetupCommonWarehousePanelMonitoringTestData(userId);

            // Act
            var result = await _productRepository.GetWarehouseProducts(warehouseId, productId, filterKeyWord, null, cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(30, result.Count);
            Assert.Contains(result, p => p.Name == "Product 1 - Supplier 1");
            Assert.Contains(result, p => p.Name == "Product 15 - Supplier 1");
            Assert.Contains(result, p => p.Name == "Product 1 - Supplier 2");
            Assert.Contains(result, p => p.Name == "Product 15 - Supplier 2");
        }

        [Fact]
        public async Task GetWarehouseProducts_WithFilterKeyword()
        {
            // Arrange
            var userId = AdminAccount.Id;
            var productId = 0;
            var warehouseId = 1;
            var filterKeyWord = "Product 14";
            var cancellationToken = CancellationToken.None;

            SetupCommonWarehousePanelMonitoringTestData(userId);

            // Act
            var result = await _productRepository.GetWarehouseProducts(warehouseId, productId, filterKeyWord, null, cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task GetWarehouseProducts_WithMultiFilterKeyword()
        {
            // Arrange
            var userId = AdminAccount.Id;
            var warehouseId = 1;
            var productId = 0;
            var filterKeyWord = "Product 13, Product 14";
            var cancellationToken = CancellationToken.None;

            SetupCommonWarehousePanelMonitoringTestData(userId);

            // Act
            var result = await _productRepository.GetWarehouseProducts(warehouseId, productId, filterKeyWord, null, cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(4, result.Count);
        }

        [Fact]
        public async Task GetWarehouseProducts_WithFilterSupplier()
        {
            // Arrange
            var userId = AdminAccount.Id;
            var warehouseId = 1;
            var productId = 0;
            var filterKeyWord = "";
            var productFilter = new ProductsFilter
            {
                SupplierId = 1, // Filter by Supplier 1
                StockStatus = ProductStockStatusEnum.None,
                PriceStatus = ProductPriceStatusEnum.None
            };
            var cancellationToken = CancellationToken.None;

            SetupCommonWarehousePanelMonitoringTestData(userId);

            // Act
            var result = await _productRepository.GetWarehouseProducts(warehouseId, productId, filterKeyWord, productFilter, cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(15, result.Count);
        }

        [Fact]
        public async Task GetWarehouseProducts_WithFilterStockStatusWithStocks()
        {
            // Arrange
            var userId = AdminAccount.Id;
            var warehouseId = 1;
            var productId = 0;
            var filterKeyWord = "";
            var productFilter = new ProductsFilter
            {
                SupplierId = 0, // Filter by Supplier 1
                StockStatus = ProductStockStatusEnum.WithStocks,
                PriceStatus = ProductPriceStatusEnum.None
            };
            var cancellationToken = CancellationToken.None;

            SetupCommonWarehousePanelMonitoringTestData(userId);

            // Act
            var result = await _productRepository.GetWarehouseProducts(warehouseId, productId, filterKeyWord, productFilter, cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(30, result.Count);
        }

        [Fact]
        public async Task GetWarehouseProducts_WithFilterStockStatusWithoutStocks()
        {
            // Arrange
            var userId = AdminAccount.Id;
            var warehouseId = 1;
            var productId = 0;
            var filterKeyWord = "";
            var productFilter = new ProductsFilter
            {
                SupplierId = 0, // Filter by Supplier 1
                StockStatus = ProductStockStatusEnum.WithoutStocks,
                PriceStatus = ProductPriceStatusEnum.None
            };
            var cancellationToken = CancellationToken.None;

            SetupCommonWarehousePanelMonitoringTestData(userId);

            // Act
            var result = await _productRepository.GetWarehouseProducts(warehouseId, productId, filterKeyWord, productFilter, cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }


        [Fact]
        public async Task GetWarehouseProducts_WithFilterPriceStatusWithPrice()
        {
            // Arrange
            var userId = AdminAccount.Id;
            var warehouseId = 1;
            var productId = 0;
            var filterKeyWord = "";
            var productFilter = new ProductsFilter
            {
                SupplierId = 0, // Filter by Supplier 1
                StockStatus = ProductStockStatusEnum.None,
                PriceStatus = ProductPriceStatusEnum.WithPrice
            };
            var cancellationToken = CancellationToken.None;

            SetupCommonWarehousePanelMonitoringTestData(userId);

            // Act
            var result = await _productRepository.GetWarehouseProducts(warehouseId, productId, filterKeyWord, productFilter, cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(30, result.Count);
        }

        [Fact]
        public async Task GetWarehouseProducts_WithFilterPriceStatusWithoutPrice()
        {
            // Arrange
            var userId = AdminAccount.Id;
            var warehouseId = 1;
            var productId = 0;
            var filterKeyWord = "";
            var productFilter = new ProductsFilter
            {
                SupplierId = 0, // Filter by Supplier 1
                StockStatus = ProductStockStatusEnum.None,
                PriceStatus = ProductPriceStatusEnum.WithoutPrice
            };
            var cancellationToken = CancellationToken.None;

            SetupCommonWarehousePanelMonitoringTestData(userId);

            // Act
            var result = await _productRepository.GetWarehouseProducts(warehouseId, productId, filterKeyWord, productFilter, cancellationToken);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }



        [Fact]
        public async Task GetWarehouseProducts_WhenAllFiltersAreApplied()
        {
            // Arrange
            var userId = AdminAccount.Id;
            var warehouseId = 1;
            var productId = 0;
            var filterKeyWord = "Product 10";
            var productFilter = new ProductsFilter
            {
                SupplierId = 1, // Only Supplier 1
                StockStatus = ProductStockStatusEnum.WithStocks,
                PriceStatus = ProductPriceStatusEnum.WithPrice
            };
            var cancellationToken = CancellationToken.None;

            SetupCommonWarehousePanelMonitoringTestData(userId);

            // Act
            var result = await _productRepository.GetWarehouseProducts(warehouseId, productId, filterKeyWord, productFilter, cancellationToken);

            // Assert
            Assert.NotNull(result);
            // Only one product should match all filters
            Assert.Single(result);
            Assert.All(result, p =>
            {
                Assert.Contains("Product 10", p.Name);
                Assert.Equal(1, p.SupplierId);
            });
        }

        [Theory]

        // Product linked to a Transaction
        [InlineData(1, "Product 1 - Supplier 1", 300)]

        // Product without any linked Transaction
        [InlineData(20, "Product 5 - Supplier 2", 300)]
        public async Task GetWarehouseProducts_WithFilteredByProductId(
            int productId,
            string productName,
            int stockQuantity
        )
        {
            // Arrange
            var userId = AdminAccount.Id;
            var warehouseId = 1;
            var filterKeyWord = "";
            var cancellationToken = CancellationToken.None;

            SetupCommonWarehousePanelMonitoringTestData(userId);

            // Act
            var result = await _productRepository.GetWarehouseProducts(warehouseId, productId, filterKeyWord, null, cancellationToken);

            // Assert
            Assert.NotNull(result);
            // Only one product should match all filters
            Assert.Single(result);
            Assert.Equal(productName, result[0].Name);
            Assert.Equal(productId, result[0].Id);
            Assert.Equal(stockQuantity, result[0].StockQuantity);
        }

        [Fact]
        public async Task GetWarehouseProducts_CancellationToken()
        {
            // Arrange
            var userId = AdminAccount.Id;
            var warehouseId = 1;
            var productId = 0;
            var filterKeyWord = "";
            var cancellationTokenSource = new CancellationTokenSource();
            var cancellationToken = cancellationTokenSource.Token;

            SetupCommonWarehousePanelMonitoringTestData(userId);

            // Act
            cancellationTokenSource.Cancel();

            await Assert.ThrowsAsync<OperationCanceledException>(async () =>
            {
                await _productRepository.GetWarehouseProducts(warehouseId, productId, filterKeyWord, null, cancellationToken);
            });
        }
    }
}

