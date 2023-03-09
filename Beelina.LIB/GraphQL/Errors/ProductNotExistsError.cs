using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class ProductNotExistsError
        : BaseError, IProductPayload
    {
        public ProductNotExistsError(int storeId)
        {
            Message = $"Product with the id of {storeId} does not exists!";
        }
    }
}
