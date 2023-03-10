using Beelina.LIB.GraphQL.Exceptions;

namespace Beelina.LIB.GraphQL.Errors.Factories
{
    public class ProductErrorFactory
         : BaseErrorFactory
    {

        public ProductNotExistsError CreateErrorFrom(ProductNotExistsException ex)
        {
            return new ProductNotExistsError(ex.ProductId);
        }
    }
}
