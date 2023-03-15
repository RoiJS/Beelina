namespace Beelina.LIB.GraphQL.Types
{
    public class ProductTransactionInput
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public double Price { get; set; }
        public int CurrentQuantity { get; set; }

        [GraphQLIgnore]
        public int DiffQuantity
        {
            get
            {
                return CurrentQuantity - Quantity;
            }
        }
    }
}
