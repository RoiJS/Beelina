namespace Beelina.LIB.GraphQL.Exceptions
{
    public class StoreNotExistsException
        : Exception
    {
        public int StoreId { get; }
        public StoreNotExistsException(int storeId)
        {
            StoreId = storeId;
        }
    }
}
