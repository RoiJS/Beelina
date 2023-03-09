using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class ProductCodeExistsError
        : BaseError, IProductPayload
    {
        public ProductCodeExistsError(string code)
        {
            Message = $"Product with the code of {code} already exists!";
        }
    }
}
