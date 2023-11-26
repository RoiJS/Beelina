using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class ProductFailedRegisterError
        : BaseError, IProductPayload
    {
        public ProductFailedRegisterError(string name)
        {
            Message = $"Failed to register product {name}!";
        }
    }
}
