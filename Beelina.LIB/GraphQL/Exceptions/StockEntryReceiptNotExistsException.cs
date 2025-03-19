namespace Beelina.LIB.GraphQL.Exceptions
{
    public class StockEntryReceiptNotExistsException
        : Exception
    {
        public int StockReceiptEntryId { get; }
        public StockEntryReceiptNotExistsException(int stockReceiptEntryId)
        {
            StockReceiptEntryId = stockReceiptEntryId;
        }
    }
}
