using Beelina.LIB.Enums;
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
            [Service] IProductRepository<Product> productRepository,
            [Service] ICurrentUserService currentUserService,
            int productId)
        {
            var productFromRepo = await productRepository.GetEntity(productId).ToObjectAsync();

            productRepository.SetCurrentUserId(currentUserService.CurrentUserId);

            if (productFromRepo == null)
                throw new ProductNotExistsException(productId);

            productRepository.DeleteEntity(productFromRepo);
            await productRepository.SaveChanges();

            return productFromRepo;
        }

        [Authorize]
        public async Task<Product> TransferProductStockFromOwnInventory(
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
            var warehouseId = 1; // Will be implemented later
            if (productSource == ProductSourceEnum.Panel && currentUserService.CurrrentBusinessModel == BusinessModelEnum.WarehousePanelMonitoring)
            {
                return await productRepository.TransferProductStockFromOwnInventory(
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
                return await productRepository.TransferWarehouseProductStockFromOwnInventory(
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
        }

        [Authorize]
        [Error(typeof(ProductErrorFactory))]
        public async Task<MapExtractedProductResult> ExtractProductsFile(
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
                var warehouseProductsFromRepo = await productRepository.GetWarehouseProducts(warehouseId, 0, "", httpContextAccessor.HttpContext.RequestAborted);
                var mapExtractedProductsResult = productRepository.MapProductImport(extractedProducts, warehouseProductsFromRepo);
                return mapExtractedProductsResult;
            }
            catch (Exception ex)
            {
                throw new ExtractProductFileException(ex.Message);
            }
        }
    }
}