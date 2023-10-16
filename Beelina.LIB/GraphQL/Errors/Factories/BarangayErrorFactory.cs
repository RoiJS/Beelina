using Beelina.LIB.GraphQL.Exceptions;

namespace Beelina.LIB.GraphQL.Errors.Factories
{
    public class BarangayErrorFactory
    : BaseErrorFactory,
         IPayloadErrorFactory<BarangayNotExistsException, BarangayNotExistsError>
    {
        public BarangayNotExistsError CreateErrorFrom(BarangayNotExistsException ex)
        {
            return new BarangayNotExistsError(ex.BarangayId);
        }
    }
}