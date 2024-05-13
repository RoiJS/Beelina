namespace Beelina.LIB.Models
{
    public class ProductTransactionQuantityHistory
    : Entity
    {
        public int ProductTransactionId { get; set; }
        public int Quantity { get; set; }

        public ProductTransaction ProductTransaction { get; set; }
    }
}