using Beelina.LIB.GraphQL.Exceptions;

namespace Beelina.LIB.GraphQL.Errors.Factories
{
    public class ClientErrorFactory
         : BaseErrorFactory,
            IPayloadErrorFactory<ClientNotExistsException, ClientNotExistsError>
    {
        public ClientNotExistsError CreateErrorFrom(ClientNotExistsException ex)
        {
            return new ClientNotExistsError(ex.ClientName);
        }
    }
}
