namespace Beelina.LIB.GraphQL.Types
{
    public class ProductInput
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int StockQuantity { get; set; }
        public float PricePerUnit { get; set; }
        public ProductUnitInput ProductUnitInput { get; set; }
    }
}
