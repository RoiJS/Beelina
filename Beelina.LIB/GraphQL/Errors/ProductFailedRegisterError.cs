using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class ProductFailedRegisterError
        : BaseError, IProductPayload
    {
        public ProductFailedRegisterError(string message)
        {
            Message = $"Failed to register product: {message}";
        }
    }
}
