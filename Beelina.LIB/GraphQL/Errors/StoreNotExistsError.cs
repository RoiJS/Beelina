using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class StoreNotExistsError
        : BaseError, IStorePayload
    {
        public StoreNotExistsError(int storeId)
        {
            Message = $"Store with the id of {storeId} does not exists!";
        }
    }
}
