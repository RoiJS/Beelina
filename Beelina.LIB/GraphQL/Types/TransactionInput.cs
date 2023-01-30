namespace Beelina.LIB.GraphQL.Types
{
    public class TransactionInput
    {
        public int Id { get; set; }
        public int StoreId { get; set; }
        public DateTime TransactionDate { get; set; }
        public List<ProductTransactionInput> ProductTransactionInputs { get; set; }
    }
}
