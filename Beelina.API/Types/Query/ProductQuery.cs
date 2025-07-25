﻿using AutoMapper;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Errors;
using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class ProductQuery
    {
        [Authorize]
        public async Task<List<Product>> UpdateProducts(
            [Service] ILogger<ProductQuery> logger,
            [Service] IProductRepository<Product> productRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            int userAccountId,
            List<ProductInput> productInputs)
        {
            var warehouseId = 1;
            try
            {
                var savedProducts = await productRepository.CreateOrUpdatePanelProducts(userAccountId, warehouseId, productInputs, httpContextAccessor.HttpContext.RequestAborted);

                logger.LogInformation("Products Updated. Params: savedProducts = {@savedProducts}", savedProducts);

                return savedProducts;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to register product. Params: userAccountId = {userAccountId}; productInputs = {@productInputs}", userAccountId, productInputs);

                throw new Exception($"Failed to register product: {ex.Message}");
            }
        }

        [Authorize]
        public async Task<List<ProductWithdrawalEntry>> UpdateProductWithdrawalEntries(
                    [Service] IProductWithdrawalEntryRepository<ProductWithdrawalEntry> productWithdrawalEntryRepository,
                    [Service] IHttpContextAccessor httpContextAccessor,
                    [Service] ICurrentUserService currentUserService,
                    [Service] ILogger<ProductQuery> logger,
                    List<ProductWithdrawalEntryInput> productWithdrawalEntryInputs
                )
        {
            productWithdrawalEntryRepository.SetCurrentUserId(currentUserService.CurrentUserId);

            try
            {
                return await productWithdrawalEntryRepository.UpdateProductWithdrawalEntriesWithBusinessLogic(
                    productWithdrawalEntryInputs,
                    httpContextAccessor.HttpContext.RequestAborted);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to update product warehouse entries. Params: userAccountId = {@productWarehouseStockReceiptEntryInputs}", productWithdrawalEntryInputs);

                throw new Exception($"Failed to update product warehouse entries: {ex.Message}");
            }
        }

        [Authorize]
        public async Task<List<ProductStockPerPanel>> UpdateProductPriceAssignments(
                    [Service] IProductRepository<Product> productRepository,
                    [Service] IHttpContextAccessor httpContextAccessor,
                    int userAccountId,
                    List<ProductStockPerPanelInput> updateProductAssignments,
                    List<int> deletedProductAssignments)
        {
            return await productRepository.UpdateProductPriceAssignments(userAccountId, updateProductAssignments, deletedProductAssignments, httpContextAccessor.HttpContext.RequestAborted);
        }

        [Authorize]
        public async Task<IProductWithdrawalEntryPayload> GetProductWithdrawalEntry(
            [Service] IProductWithdrawalEntryRepository<ProductWithdrawalEntry> productWithdrawalEntryRepository,
            [Service] ILogger<ProductQuery> logger,
            [Service] IHttpContextAccessor httpContextAccessor,
            int id
        )
        {
            try
            {
                var withdrawalEntryFromRepo = await productWithdrawalEntryRepository.GetProductWithdrawalEntry(id, httpContextAccessor.HttpContext.RequestAborted);

                if (withdrawalEntryFromRepo is null)
                {
                    return new ProductWithdrawalEntryNotExistsError(id);
                }

                return withdrawalEntryFromRepo;
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
        public async Task<IList<ProductWithdrawalEntry>> GetProductWithdrawalEntries(
                     [Service] IProductWithdrawalEntryRepository<ProductWithdrawalEntry> productWithdrawalEntryRepository,
                     [Service] IHttpContextAccessor httpContextAccessor,
                     ProductWithdrawalFilter productWithdrawalEntryFilter,
                     string filterKeyword = ""
                )
        {
            return await productWithdrawalEntryRepository.GetProductWithdarawalEntries(productWithdrawalEntryFilter, filterKeyword, httpContextAccessor.HttpContext.RequestAborted);
        }

        [Authorize]
        public async Task<string> GetLatestProductWithdrawalCode(
            [Service] IProductWithdrawalEntryRepository<ProductWithdrawalEntry> productWithdrawalEntryRepository,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            return await productWithdrawalEntryRepository.GetLastProductWithdrawalCode(httpContextAccessor.HttpContext.RequestAborted);
        }

        [Authorize]
        [UsePaging(MaxPageSize = 1000, DefaultPageSize = 50, IncludeTotalCount = true)]
        [UseProjection]
        [UseFiltering]
        public async Task<IList<Product>> GetProducts(
            [Service] IProductRepository<Product> productRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            int userAccountId,
            ProductsFilter productsFilter,
            string filterKeyword = "")
        {
            return await productRepository.GetProducts(userAccountId, 0, filterKeyword, productsFilter, httpContextAccessor.HttpContext.RequestAborted);
        }


        [Authorize]
        public async Task<IProductPayload> GetProduct(
            [Service] IProductRepository<Product> productRepository,
            [Service] IProductStockPerWarehouseRepository<ProductStockPerWarehouse> productStockPerWarehouseRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            [Service] ICurrentUserService currentUserService,
            [Service] IMapper mapper,
            int productId,
            int userAccountId
            )
        {
            var warehouseId = 1;

            var productFromRepo = await productRepository.GetProducts(userAccountId, productId, "", null, httpContextAccessor.HttpContext.RequestAborted);

            if (productFromRepo == null || productFromRepo?.Count == 0)
            {
                return new ProductNotExistsError(productId);
            }

            var productResult = mapper.Map<ProductInformationResult>(productFromRepo?[0]);

            // Set default price based on warehouse price.
            if (productResult.Price == 0)
            {
                var productStockWarehouseFromRepo = await productStockPerWarehouseRepository.GetProductStockPerWarehouse(productId, warehouseId);

                if (productStockWarehouseFromRepo != null)
                {
                    productResult.DefaultPrice = productStockWarehouseFromRepo.Price;
                }
            }

            // Get remaining stocks from warehouse
            if (currentUserService.CurrrentBusinessModel == BusinessModelEnum.WarehousePanelMonitoring)
            {
                var warehouseProductFromRepo = await productRepository.GetWarehouseProducts(warehouseId, productId, "", null, httpContextAccessor.HttpContext.RequestAborted);
                if (warehouseProductFromRepo != null && warehouseProductFromRepo.Count > 0)
                {
                    productResult.StocksRemainingFromWarehouse = warehouseProductFromRepo[0].StockQuantity;
                }
            }

            return productResult;
        }

        [Authorize]
        [UsePaging(MaxPageSize = 100, DefaultPageSize = 100)]
        [UseProjection]
        [UseFiltering]
        [UseSorting]
        public async Task<List<ProductStockAuditItem>> GetProductStockAuditItems([Service] IProductRepository<Product> productRepository, [Service] IHttpContextAccessor httpContextAccessor, int productId, StockAuditSourceEnum stockAuditSource, int userAccountId, string? fromDate, string? toDate)
        {
            return await productRepository.GetProductStockAuditItems(productId, userAccountId, stockAuditSource, fromDate, toDate, httpContextAccessor.HttpContext.RequestAborted);
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
        public async Task<double> GetInventoryPanelTotalValue(
            [Service] IProductRepository<Product> productRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            int userAccountId)
        {
            var productsFromRepo = await productRepository.GetProducts(userAccountId, 0, "", null, httpContextAccessor.HttpContext.RequestAborted);
            var inventoryTotalValue = productsFromRepo.Sum(x => x.StockQuantity * x.Price);
            return inventoryTotalValue;
        }

        [Authorize]
        public async Task<IProductWithdrawalPayload> CheckProductWithdrawalCode(
            [Service] IProductWithdrawalEntryRepository<ProductWithdrawalEntry> productWithdrawalEntryRepository,
            int productWithdrawalId,
            string withdrawalSlipNo)
        {
            var productWithdrawalFromRepo = await productWithdrawalEntryRepository.GetProductWithdrawalByUniqueCode(productWithdrawalId, withdrawalSlipNo);
            return new CheckProductWithdrawalCodeInformationResult(productWithdrawalFromRepo != null);
        }

        [Authorize]
        [UseOffsetPaging(MaxPageSize = 50, DefaultPageSize = 50, IncludeTotalCount = true)]
        [UseProjection]
        [UseFiltering]
        [UseSorting]
        public async Task<IEnumerable<Product>> GetProductPriceAssignments(
            [Service] IProductRepository<Product> productRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            int userAccountId,
            ProductsFilter productsFilter,
            string filterKeyword = "")
        {
            return await productRepository.GetProductPriceAssignments(userAccountId, filterKeyword, productsFilter, httpContextAccessor.HttpContext.RequestAborted);
        }

        [Authorize]
        public async Task<List<ProductStockPerPanel>> CopyProductPriceAssignments(
            [Service] IProductRepository<Product> productRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            int sourceUserAccountId,
            int destinationUserAccountId)
        {
            return await productRepository.CopyProductPriceAssignments(
                sourceUserAccountId,
                destinationUserAccountId,
                httpContextAccessor.HttpContext.RequestAborted
            );
        }

        [Authorize]
        public async Task<string> GetLatestProductCode(
            [Service] IProductRepository<Product> productRepository,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            return await productRepository.GetLatestProductCode(httpContextAccessor.HttpContext.RequestAborted);
        }

        [Authorize]
        public async Task<string> GetLatestTransactionCode(
            [Service] IProductRepository<Product> productRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            int userAccountId)
        {
            return await productRepository.GetLatestTransactionCode(userAccountId, httpContextAccessor.HttpContext.RequestAborted);
        }

        private static async Task SetProductStockPanels(ProductWithdrawalEntryInput productWithdrawalEntryInput, IProductRepository<Product> productRepository, CancellationToken cancellationToken)
        {
            foreach (var productStockAudit in productWithdrawalEntryInput.ProductStockAuditsInputs)
            {
                var product = new Product
                {
                    Id = productStockAudit.ProductId
                };

                var productInput = new ProductInput
                {
                    Id = productStockAudit.ProductId,
                    PricePerUnit = productStockAudit.PricePerUnit
                };

                var productStockPerPanel = await productRepository.ManageProductStockPerPanel(product, productInput, productWithdrawalEntryInput.UserAccountId, cancellationToken);

                productStockAudit.ProductStockPerPanelId = productStockPerPanel.Id;
            }
        }
    }
}
