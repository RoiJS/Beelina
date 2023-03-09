namespace Beelina.LIB.GraphQL.Types
{
    public class TransactionInput
    {
        public int Id { get; set; }
        public int StoreId { get; set; }
        public string TransactionDate { get; set; }
        public List<ProductTransactionInput> ProductTransactionInputs { get; set; }
    }
}
