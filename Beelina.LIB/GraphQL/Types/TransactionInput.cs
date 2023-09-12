using Beelina.LIB.Enums;

namespace Beelina.LIB.GraphQL.Types
{
    public class TransactionInput
    {
        public int Id { get; set; }
        public int StoreId { get; set; }
        public string TransactionDate { get; set; }
        public TransactionStatusEnum Status { get; set; }
        public List<ProductTransactionInput> ProductTransactionInputs { get; set; }
    }
}
