using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class ProductWarehouseStockReceiptEntryNotExistsError
        : BaseError, IProductWarehouseStockReceiptEntryPayload
    {
        public ProductWarehouseStockReceiptEntryNotExistsError(int id)
        {
            Message = $"Product warehouse stock receipt entry with the id of {id} does not exists!";
        }
    }
}
