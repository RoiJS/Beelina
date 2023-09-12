namespace Beelina.LIB.Dtos
{
    public class ProductTransactionDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public double Price { get; set; }
        public int CurrentQuantity { get; set; }
    }
}