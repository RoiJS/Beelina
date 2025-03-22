using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class ProductWithdrawalError
        : BaseError, IProductPayload
    {
        public ProductWithdrawalError(string message)
        {
            Message = message;
        }
    }
}
