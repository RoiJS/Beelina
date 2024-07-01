namespace Beelina.LIB.GraphQL.Exceptions
{
    public class SupplierNotExistsException(int supplierId)
                : Exception
    {
        public int SupplierId { get; } = supplierId;
    }
}
