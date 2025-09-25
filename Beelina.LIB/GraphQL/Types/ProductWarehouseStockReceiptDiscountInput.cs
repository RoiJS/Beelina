namespace Beelina.LIB.GraphQL.Types
{
    public class ProductWarehouseStockReceiptDiscountInput
    {
        public int Id { get; set; }
        public double DiscountPercentage { get; set; }
        public int DiscountOrder { get; set; }
        public string Description { get; set; }
    }
}