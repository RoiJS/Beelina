namespace Beelina.LIB.GraphQL.Exceptions
{
    public class ProductNotExistsException
        : Exception
    {
        public int ProductId { get; }
        public ProductNotExistsException(int productId)
        {
            ProductId = productId;
        }
    }
}
