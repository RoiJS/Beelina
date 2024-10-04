﻿using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Errors.Factories;
using Beelina.LIB.GraphQL.Exceptions;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class ProductMutation
    {
        [Authorize]
        [Error(typeof(ProductErrorFactory))]
        public async Task<Product> DeleteProduct(
            [Service] ILogger<ProductMutation> logger,
            [Service] IProductRepository<Product> productRepository,
            [Service] ICurrentUserService currentUserService,
            int productId)
        {
            try
            {
                var productFromRepo = await productRepository.GetEntity(productId).ToObjectAsync();

                productRepository.SetCurrentUserId(currentUserService.CurrentUserId);

                if (productFromRepo == null)
                    throw new ProductNotExistsException(productId);

                productRepository.DeleteEntity(productFromRepo);
                await productRepository.SaveChanges();

                logger.LogInformation("Product successfully deleted. Params: productId = {productId}", productId);
                return productFromRepo;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to delete product. Params: productId = {productId}", productId);

                throw new Exception($"Failed to delete product. {ex.Message}");
            }
        }

        [Authorize]
        public async Task<Product> TransferProductStockFromOwnInventory(
                    [Service] ILogger<ProductMutation> logger,
                    [Service] IProductRepository<Product> productRepository,
                    [Service] IHttpContextAccessor httpContextAccessor,
                    [Service] ICurrentUserService currentUserService,
                    int userAccountId,
                    int sourceProductId,
                    int destinationProductId,
                    int destinationProductNumberOfUnits,
                    int sourceProductNumberOfUnits,
                    int sourceNumberOfUnitsTransfered,
                    TransferProductStockTypeEnum transferProductStockType,
                    ProductSourceEnum productSource)
        {
            try
            {
                var warehouseId = 1; // Will be implemented later
                var resultProduct = new Product();

                if (productSource == ProductSourceEnum.Panel && currentUserService.CurrrentBusinessModel == BusinessModelEnum.WarehousePanelMonitoring)
                {
                    resultProduct = await productRepository.TransferProductStockFromOwnInventory(
                                userAccountId,
                                warehouseId,
                                sourceProductId,
                                destinationProductId,
                                destinationProductNumberOfUnits,
                                sourceProductNumberOfUnits,
                                sourceNumberOfUnitsTransfered,
                                transferProductStockType,
                                httpContextAccessor.HttpContext.RequestAborted
                            );
                }
                else
                {
                    resultProduct = await productRepository.TransferWarehouseProductStockFromOwnInventory(
                                    userAccountId,
                                    warehouseId,
                                    sourceProductId,
                                    destinationProductId,
                                    destinationProductNumberOfUnits,
                                    sourceProductNumberOfUnits,
                                    sourceNumberOfUnitsTransfered,
                                    transferProductStockType,
                                    httpContextAccessor.HttpContext.RequestAborted
                                );
                }

                logger.LogInformation(
                    "Successfully transferred product quantity. Params: {@params}", new
                    {
                        userAccountId,
                        sourceProductId,
                        destinationProductId,
                        destinationProductNumberOfUnits,
                        sourceProductNumberOfUnits,
                        sourceNumberOfUnitsTransfered,
                        transferProductStockType,
                        productSource
                    }
                );

                return resultProduct;
            }
            catch (Exception ex)
            {
                logger.LogError(
                    ex,
                    "Failed to transfer product quantity. Params: {@params}",
                    new
                    {
                        userAccountId,
                        sourceProductId,
                        destinationProductId,
                        destinationProductNumberOfUnits,
                        sourceProductNumberOfUnits,
                        sourceNumberOfUnitsTransfered,
                        transferProductStockType,
                        productSource
                    }
                );

                throw new Exception($"Failed to transfer product quantity. {ex.Message}"); ;
            }
        }

        [Authorize]
        [Error(typeof(ProductErrorFactory))]
        public async Task<MapExtractedProductResult> ExtractProductsFile(
            [Service] ILogger<ProductMutation> logger,
            [Service] IProductRepository<Product> productRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            [Service] IExtractProductFileService extractProductFileService,
            int warehouseId,
            IFile file)
        {
            try
            {
                await using Stream stream = file.OpenReadStream();
                var extractedProducts = await extractProductFileService.ReadFile(stream);
                var warehouseProductsFromRepo = await productRepository.GetWarehouseProducts(warehouseId, 0, "", null, httpContextAccessor.HttpContext.RequestAborted);
                var mapExtractedProductsResult = productRepository.MapProductImport(extractedProducts, warehouseProductsFromRepo);

                logger.LogInformation("Successfully extracted product excel file. Params: {@params}", new { warehouseId, file });
                return mapExtractedProductsResult;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to extract product excel file. Params: {@params}", new { warehouseId, file });
                throw new ExtractProductFileException(ex.Message);
            }
        }
    }
}