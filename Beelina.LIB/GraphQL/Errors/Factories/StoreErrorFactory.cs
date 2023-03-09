using Beelina.LIB.GraphQL.Exceptions;

namespace Beelina.LIB.GraphQL.Errors.Factories
{
    public class StoreErrorFactory
         : BaseErrorFactory,
         IPayloadErrorFactory<StoreNotExistsException, StoreNotExistsError>
    {
        public StoreNotExistsError CreateErrorFrom(StoreNotExistsException ex)
        {
            return new StoreNotExistsError(ex.StoreId);
        }
    }
}
