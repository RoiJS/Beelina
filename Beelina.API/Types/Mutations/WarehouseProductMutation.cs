using Beelina.LIB.GraphQL.Errors.Factories;
using Beelina.LIB.GraphQL.Exceptions;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class WarehouseProductMutation
    {
        [Authorize]
        [Error(typeof(WarehouseProductErrorFactory))]
        public async Task<ProductWarehouseStockReceiptEntry> DeleteWarehouseStockReceiptEntry(
            [Service] ILogger<WarehouseProductMutation> logger,
            [Service] IProductWarehouseStockReceiptEntryRepository<ProductWarehouseStockReceiptEntry> productWarehouseStockReceiptEntryRepository,
            [Service] ICurrentUserService currentUserService,
            int stockEntryReceiptId)
        {
            try
            {
                productWarehouseStockReceiptEntryRepository.SetCurrentUserId(currentUserService.CurrentUserId);

                var stockEntryFromRepo = await productWarehouseStockReceiptEntryRepository
                                            .GetEntity(stockEntryReceiptId)
                                            .Includes(s => s.ProductStockWarehouseAudits)
                                            .ToObjectAsync();

                if (stockEntryFromRepo == null)
                    throw new ProductNotExistsException(stockEntryReceiptId);

                productWarehouseStockReceiptEntryRepository.DeleteEntity(stockEntryFromRepo, true);
                await productWarehouseStockReceiptEntryRepository.SaveChanges();

                logger.LogInformation("Stock Receipt Entry has successfully deleted. Params: productId = {stockEntryReceiptId}", stockEntryReceiptId);
                return stockEntryFromRepo;
            }
            catch (ProductNotExistsException ex)
            {
                logger.LogError(ex, "Failed to delete Stock Receipt Entry. Params: productId = {stockEntryReceiptId}", stockEntryReceiptId);

                throw new ProductNotExistsException(stockEntryReceiptId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to delete Stock Receipt Entry. Params: productId = {stockEntryReceiptId}", stockEntryReceiptId);

                throw new Exception($"Failed to delete delete Stock Receipt Entry. {ex.Message}");
            }
        }
    }
}