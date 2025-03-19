using Beelina.LIB.GraphQL.Exceptions;

namespace Beelina.LIB.GraphQL.Errors.Factories
{
    public class WarehouseProductErrorFactory
         : BaseErrorFactory
    {
        public StockReceiptEntryNotExistsError CreateErrorFrom(StockEntryReceiptNotExistsException ex)
        {
            return new StockReceiptEntryNotExistsError(ex.StockReceiptEntryId);
        }
    }
}
