using Beelina.LIB.GraphQL.Exceptions;

namespace Beelina.LIB.GraphQL.Errors.Factories
{
    public class SupplierErrorFactory
    : BaseErrorFactory,
         IPayloadErrorFactory<SupplierNotExistsException, SupplierNotExistsError>
    {
        public SupplierNotExistsError CreateErrorFrom(SupplierNotExistsException ex)
        {
            return new SupplierNotExistsError(ex.SupplierId);
        }
    }
}