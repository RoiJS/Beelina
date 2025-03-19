using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class StockReceiptEntryNotExistsError
        : BaseError, IProductPayload
    {
        public StockReceiptEntryNotExistsError(int stockReceiptEntryId)
        {
            Message = $"Stock Receipt Entry with the id of {stockReceiptEntryId} does not exists!";
        }
    }
}
