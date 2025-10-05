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
using Beelina.LIB.Helpers.Extensions;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class WarehouseProductQuery
    {
        [Authorize]
        public async Task<List<Product>> UpdateWarehouseProducts(
            [Service] ILogger<WarehouseProductQuery> logger,
            [Service] IProductRepository<Product> productRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            int warehouseId,
            List<ProductInput> productInputs)
        {
            try
            {
                var savedProducts = await productRepository.CreateOrUpdateWarehouseProducts(warehouseId, productInputs, httpContextAccessor?.HttpContext?.RequestAborted ?? default);

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
        public async Task<List<ProductWarehouseStockReceiptEntry>> UpdateWarehouseStockReceiptEntries(
            [Service] IProductWarehouseStockReceiptEntryRepository<ProductWarehouseStockReceiptEntry> productWarehouseStockReceiptEntryRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            [Service] ICurrentUserService currentUserService,
            [Service] ILogger<WarehouseProductQuery> logger,
            List<ProductWarehouseStockReceiptEntryInput> productWarehouseStockReceiptEntryInputs
        )
        {
            productWarehouseStockReceiptEntryRepository.SetCurrentUserId(currentUserService.CurrentUserId);

            try
            {
                var updatedEntries = await productWarehouseStockReceiptEntryRepository
                    .UpdateProductWarehouseStockReceiptEntriesBatch(
                        productWarehouseStockReceiptEntryInputs,
                        httpContextAccessor?.HttpContext?.RequestAborted ?? default
                    );

                return updatedEntries;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to update product warehouse entries. Params: userAccountId = {@productWarehouseStockReceiptEntryInputs}", productWarehouseStockReceiptEntryInputs);

                throw new Exception($"Failed to update product warehouse entries: {ex.Message}");
            }
        }

        [Authorize]
        public async Task<IProductWarehouseStockReceiptEntryPayload> GetProductWarehouseStockReceiptEntry(
            [Service] IProductWarehouseStockReceiptEntryRepository<ProductWarehouseStockReceiptEntry> productWarehouseStockReceiptEntryRepository,
            [Service] ILogger<WarehouseProductQuery> logger,
            [Service] IHttpContextAccessor httpContextAccessor,
            int id
        )
        {
            try
            {
                var stockEntryFromRepo = await productWarehouseStockReceiptEntryRepository.GetProductWarehouseStockReceiptEntry(id, httpContextAccessor?.HttpContext?.RequestAborted ?? default);

                if (stockEntryFromRepo is null)
                {
                    return new ProductWarehouseStockReceiptEntryNotExistsError(id);
                }

                return stockEntryFromRepo;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get product wareshouse entry. Params: id = {id};", id);

                throw new Exception($"Failed to get product ware`shouse entry. {ex.Message}");
            }
        }

        [Authorize]
        [UseOffsetPaging(MaxPageSize = 50, DefaultPageSize = 50, IncludeTotalCount = true)]
        [UseProjection]
        [UseFiltering]
        [UseSorting]
        public async Task<IList<ProductWarehouseStockReceiptEntry>> GetProductWarehouseStockReceiptEntries(
                     [Service] IProductWarehouseStockReceiptEntryRepository<ProductWarehouseStockReceiptEntry> productWarehouseStockReceiptEntryRepository,
                     [Service] IHttpContextAccessor httpContextAccessor,
                     ProductReceiptEntryFilter productReceiptEntryFilter,
                     string filterKeyword = ""
                )
        {
            return await productWarehouseStockReceiptEntryRepository.GetProductWarehouseStockReceiptEntries(productReceiptEntryFilter, filterKeyword, httpContextAccessor?.HttpContext?.RequestAborted ?? default);
        }

        [Authorize]
        public async Task<string> GetLatestStockEntryReferenceNo(
            [Service] IProductWarehouseStockReceiptEntryRepository<ProductWarehouseStockReceiptEntry> productWarehouseStockReceiptEntryRepository,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            return await productWarehouseStockReceiptEntryRepository.GetStockEntryLatestReferenceNo(httpContextAccessor?.HttpContext?.RequestAborted ?? default);
        }

        [Authorize]
        [UsePaging(MaxPageSize = 1000, DefaultPageSize = 50, IncludeTotalCount = true)]
        [UseProjection]
        [UseFiltering]
        public async Task<IList<Product>> GetWarehouseProducts(
            [Service] IProductRepository<Product> productRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            int warehouseId,
            ProductsFilter productsFilter,
            string filterKeyword = "")
        {
            return await productRepository.GetWarehouseProducts(warehouseId, 0, filterKeyword, productsFilter, httpContextAccessor?.HttpContext?.RequestAborted ?? default);
        }

        [Authorize]
        public async Task<IProductPayload> GetWarehouseProduct(
            [Service] IProductRepository<Product> productRepository,
            [Service] IMapper mapper,
            [Service] IHttpContextAccessor httpContextAccessor,
            int productId,
            int warehouseId)
        {
            var productFromRepo = await productRepository.GetWarehouseProducts(warehouseId, productId, "", null, httpContextAccessor?.HttpContext?.RequestAborted ?? default);

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
            var productFromRepo = await productRepository.GetWarehouseProducts(warehouseId, productId, "", null, httpContextAccessor?.HttpContext?.RequestAborted ?? default);
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

        [Authorize]
        public async Task<IPurchaseOrderPayload> CheckPurchaseOrderCode(
            [Service] IProductWarehouseStockReceiptEntryRepository<ProductWarehouseStockReceiptEntry> productWarehouseStockReceiptEntryRepository,
            int purchaseOrderId,
            string referenceCode)
        {
            var purchaseOrderFromRepo = await productWarehouseStockReceiptEntryRepository.GetPurchaseOrderByUniqueCode(purchaseOrderId, referenceCode);
            return new CheckPurchaseOrderCodeInformationResult(purchaseOrderFromRepo != null);
        }

        [Authorize]
        public async Task<double> GetInventoryWarehouseTotalValue(
            [Service] IProductRepository<Product> productRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            int warehouseId)
        {
            var productsFromRepo = await productRepository.GetWarehouseProducts(warehouseId, 0, "", null, httpContextAccessor?.HttpContext?.RequestAborted ?? default);
            var inventoryTotalValue = productsFromRepo.Sum(x => x.StockQuantity * x.Price);
            return inventoryTotalValue;
        }
    }
}
