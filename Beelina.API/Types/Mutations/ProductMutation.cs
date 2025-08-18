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
            catch (ProductNotExistsException ex)
            {
                logger.LogError(ex, "Failed to delete product. Params: productId = {productId}", productId);

                throw new ProductNotExistsException(productId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to delete product. Params: productId = {productId}", productId);

                throw new Exception($"Failed to delete product. {ex.Message}");
            }
        }


        [Authorize]
        [Error(typeof(ProductErrorFactory))]
        public async Task<ProductWithdrawalEntry> DeleteProductWithdrawalEntry(
                    [Service] ILogger<ProductMutation> logger,
                    [Service] IProductWithdrawalEntryRepository<ProductWithdrawalEntry> productWithdrawalEntryRepository,
                    [Service] ICurrentUserService currentUserService,
                    int withdrawalId)
        {
            try
            {
                productWithdrawalEntryRepository.SetCurrentUserId(currentUserService.CurrentUserId);

                var withdrawalEntryFromRepo = await productWithdrawalEntryRepository
                                            .GetEntity(withdrawalId)
                                            .Includes(s => s.ProductStockAudits)
                                            .ToObjectAsync();

                if (withdrawalEntryFromRepo == null)
                    throw new ProductWithdrawalNotExistsException(withdrawalId);

                productWithdrawalEntryRepository.DeleteEntity(withdrawalEntryFromRepo, true);
                await productWithdrawalEntryRepository.SaveChanges();

                logger.LogInformation("Product Withdrawal Entry has successfully deleted. Params: withdrawalId = {withdrawalId}", withdrawalId);
                return withdrawalEntryFromRepo;
            }
            catch (ProductWithdrawalNotExistsException ex)
            {
                logger.LogError(ex, "Failed to delete product withdrawal entry. Params: withdrawalId = {withdrawalId}", withdrawalId);

                throw new ProductWithdrawalNotExistsException(withdrawalId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to delete product withdrawal entry. Params: withdrawalId = {withdrawalId}", withdrawalId);

                throw new Exception($"Failed to delete product withdrawal entry. {ex.Message}");
            }
        }

        [Authorize]
        public async Task<Product> TransferProductStockFromOwnInventory(
                    [Service] IUserAccountRepository<UserAccount> userAccountRepository,
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
                var userAccountFromRepo = await userAccountRepository.GetEntity(userAccountId).ToObjectAsync();
                
                if ((productSource == ProductSourceEnum.Panel && currentUserService.CurrrentBusinessModel == BusinessModelEnum.WarehousePanelMonitoring) ||
                (currentUserService.CurrrentBusinessModel == BusinessModelEnum.WarehousePanelHybridMonitoring && userAccountFromRepo.SalesAgentType == SalesAgentTypeEnum.FieldAgent))
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
                var mapExtractedProductsResult = await productRepository.MapProductImport(extractedProducts, warehouseProductsFromRepo);

                logger.LogInformation("Successfully extracted product excel file. Params: {@params}", new { warehouseId, file });
                return mapExtractedProductsResult;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to extract product excel file. Params: {@params}", new { warehouseId, file });
                throw new ExtractProductFileException(ex.Message);
            }
        }

        [Authorize]
        [Error(typeof(ProductErrorFactory))]
        public async Task<bool> ResetSalesAgentProductStocks(
            [Service] ILogger<ProductMutation> logger,
            [Service] IProductRepository<Product> productRepository,
            [Service] ICurrentUserService currentUserService,
            int salesAgentId)
        {
            var result = await productRepository.ResetSalesAgentProductStocks(salesAgentId, currentUserService.CurrentUserId);

            if (result)
            {
                logger.LogInformation("Successfully reset sales agent product stocks. Params: salesAgentId = {salesAgentId}", salesAgentId);
            }
            else
            {
                logger.LogError("Failed to reset sales agent product stocks. Params: salesAgentId = {salesAgentId}", salesAgentId);
            }

            return result;
        }

        [Authorize]
        [Error(typeof(ProductErrorFactory))]
        public async Task<List<ProductStockPerPanel>> AssignProductToSalesAgents(
            [Service] ILogger<ProductMutation> logger,
            [Service] IProductRepository<Product> productRepository,
            [Service] ICurrentUserService currentUserService,
            int productId,
            List<int> salesAgentIds,
            int warehouseId = 1)
        {
            try
            {
                logger.LogInformation("Starting product assignment for productId: {productId} to {salesAgentCount} sales agents, warehouseId: {warehouseId}", 
                    productId, salesAgentIds.Count, warehouseId);

                var result = await productRepository.AssignProductToSalesAgents(
                    productId, 
                    salesAgentIds,
                    warehouseId, 
                    currentUserService.CurrentUserId);

                logger.LogInformation("Successfully assigned product {productId} to {assignmentCount} sales agents", 
                    productId, result.Count);

                return result;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to assign product to sales agents. Params: productId = {productId}, salesAgentIds = {salesAgentIds}, warehouseId = {warehouseId}", 
                    productId, string.Join(",", salesAgentIds), warehouseId);
                throw new Exception($"Failed to assign product to sales agents. {ex.Message}");
            }
        }
    }
}