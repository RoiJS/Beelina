using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class ExtractedProductsFileError
        : BaseError, IProductPayload
    {
        public ExtractedProductsFileError(string message)
        {
            Message = message;
        }
    }
}
