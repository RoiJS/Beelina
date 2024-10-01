using AutoMapper;
using Beelina.LIB.Dtos;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Errors;
using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class WarehouseProductQuery
    {
        [Authorize]
        public async Task<List<Product>> UpdateWarehouseProducts(
            [Service] ILogger<ProductQuery> logger,
            [Service] IProductRepository<Product> productRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            int warehouseId,
            List<ProductInput> productInputs)
        {
            try
            {
                var savedProducts = await productRepository.CreateOrUpdateWarehouseProducts(warehouseId, productInputs, httpContextAccessor.HttpContext.RequestAborted);

                logger.LogInformation("Products Updated. Params: savedProducts = {@savedProducts}", savedProducts);

                return savedProducts;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to register product. Params: userAccountId = {userAccountId}; warehouseId = {@productInputs}", warehouseId, productInputs);

                throw new Exception($"Failed to register product: {ex.Message}");
            }
        }

        [Authorize]
        [UsePaging(MaxPageSize = 50, DefaultPageSize = 50, IncludeTotalCount = true)]
        [UseProjection]
        [UseFiltering]
        public async Task<IList<Product>> GetWarehouseProducts([Service] IProductRepository<Product> productRepository, [Service] IHttpContextAccessor httpContextAccessor, int warehouseId, ProductsFilter productsFilter, string filterKeyword = "")
        {
            return await productRepository.GetWarehouseProducts(warehouseId, 0, filterKeyword, productsFilter, httpContextAccessor.HttpContext.RequestAborted);
        }

        [Authorize]
        public async Task<IProductPayload> GetWarehouseProduct([Service] IProductRepository<Product> productRepository, [Service] IMapper mapper, [Service] IHttpContextAccessor httpContextAccessor, int productId, int warehouseId)
        {
            var productFromRepo = await productRepository.GetWarehouseProducts(warehouseId, productId, "", null, httpContextAccessor.HttpContext.RequestAborted);

            if (productFromRepo == null || productFromRepo?.Count == 0)
            {
                return new ProductNotExistsError(productId);
            }

            var productResult = mapper.Map<ProductInformationResult>(productFromRepo?[0]);

            return productResult;
        }

        [Authorize]
        [UsePaging(MaxPageSize = 100, DefaultPageSize = 100)]
        [UseProjection]
        [UseFiltering]
        [UseSorting]
        public async Task<List<ProductStockAuditItem>> GetWarehouseProductStockAuditItems([Service] IProductRepository<Product> productRepository, int productId, StockAuditSourceEnum stockAuditSource, int warehouseId, string? fromDate, string? toDate)
        {
            return await productRepository.GetWarehouseProductStockAuditItems(productId, warehouseId, stockAuditSource, fromDate, toDate);
        }

        [Authorize]
        public async Task<List<InsufficientProductQuantity>> CheckWarehouseProductStockQuantity([Service] IProductRepository<Product> productRepository, [Service] IHttpContextAccessor httpContextAccessor, int productId, int warehouseId, int quantity)
        {
            var insufficientProductQuantities = new List<InsufficientProductQuantity>();
            var productFromRepo = await productRepository.GetWarehouseProducts(warehouseId, productId, "", null, httpContextAccessor.HttpContext.RequestAborted);
            if (productFromRepo != null && productFromRepo[0].StockQuantity < quantity)
            {
                var product = productFromRepo[0];
                insufficientProductQuantities.Add(new InsufficientProductQuantity
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    ProductCode = product.Code,
                    SelectedQuantity = quantity,
                    CurrentQuantity = product.StockQuantity
                });
            }
            return insufficientProductQuantities;
        }
    }
}
