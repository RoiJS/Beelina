namespace Beelina.LIB.GraphQL.Exceptions
{
    public class ProductStockAuditNotExistsException
        : Exception
    {
        public int Id { get; }
        public ProductStockAuditNotExistsException(int id)
        {
            Id = id;
        }
    }
}
