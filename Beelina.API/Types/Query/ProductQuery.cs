using AutoMapper;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Errors;
using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class ProductQuery
    {
        [Authorize]
        public async Task<List<Product>> UpdateProducts(
            [Service] IProductRepository<Product> productRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            int userAccountId,
            List<ProductInput> productInputs)
        {
            var warehouseId = 1;
            var savedProducts = new List<Product>();
            try
            {
                savedProducts = await productRepository.CreateOrUpdatePanelProducts(userAccountId, warehouseId, productInputs, httpContextAccessor.HttpContext.RequestAborted);
            }
            catch (Exception ex)
            {
                throw new Exception("$Failed to register product: {ex.Message}");
            }

            return savedProducts;
        }

        [Authorize]
        [UsePaging(MaxPageSize = 50, DefaultPageSize = 50, IncludeTotalCount = true)]
        [UseProjection]
        [UseFiltering]
        public async Task<IList<Product>> GetProducts([Service] IProductRepository<Product> productRepository, [Service] IHttpContextAccessor httpContextAccessor, int userAccountId, string filterKeyword = "")
        {
            return await productRepository.GetProducts(userAccountId, 0, filterKeyword, httpContextAccessor.HttpContext.RequestAborted);
        }

        [Authorize]
        public async Task<IProductPayload> GetProduct(
            [Service] IProductRepository<Product> productRepository,
            [Service] IProductStockPerWarehouseRepository<ProductStockPerWarehouse> productStockPerWarehouseRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            [Service] IMapper mapper, int productId, int userAccountId)
        {
            var productFromRepo = await productRepository.GetProducts(userAccountId, productId, "", httpContextAccessor.HttpContext.RequestAborted);

            if (productFromRepo == null || productFromRepo?.Count == 0)
            {
                return new ProductNotExistsError(productId);
            }

            var productResult = mapper.Map<ProductInformationResult>(productFromRepo?[0]);

            // Set default price based on warehouse price.
            if (productResult.Price == 0)
            {
                var productStockWarehouseFromRepo = await productStockPerWarehouseRepository.GetProductStockPerWarehouse(productId, 1);
                productResult.DefaultPrice = productStockWarehouseFromRepo.PricePerUnit;
            }

            return productResult;
        }

        [Authorize]
        [UsePaging(MaxPageSize = 100, DefaultPageSize = 100)]
        [UseProjection]
        [UseFiltering]
        [UseSorting]
        public async Task<List<ProductStockAuditItem>> GetProductStockAuditItems([Service] IProductRepository<Product> productRepository, int productId, StockAuditSourceEnum stockAuditSource, int userAccountId, string? fromDate, string? toDate)
        {
            return await productRepository.GetProductStockAuditItems(productId, userAccountId, stockAuditSource, fromDate, toDate);
        }

        [Authorize]
        public async Task<List<Product>> GetProductsDetailList([Service] IProductRepository<Product> productRepository, int userAccountId, string filterKeyword = "")
        {
            return await productRepository.GetProductsDetailList(userAccountId, filterKeyword);
        }

        [Authorize]
        public async Task<IProductPayload> CheckProductCode([Service] IProductRepository<Product> productRepository, int productId, string productCode)
        {
            var productFromRepo = await productRepository.GetProductByUniqueCode(productId, productCode);
            return new CheckProductCodeInformationResult(productFromRepo != null);
        }

        [Authorize]
        public async Task<double> GetInventoryPanelTotalValue([Service] IProductRepository<Product> productRepository, [Service] IHttpContextAccessor httpContextAccessor, int userAccountId)
        {
            var productsFromRepo = await productRepository.GetProducts(userAccountId, 0, "", httpContextAccessor.HttpContext.RequestAborted);
            var inventoryTotalValue = productsFromRepo.Sum(x => x.StockQuantity * x.Price);
            return inventoryTotalValue;
        }
    }
}
