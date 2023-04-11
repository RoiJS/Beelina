using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class ClientNotExistsError
        : BaseError, IClientInformationPayload
    {
        public ClientNotExistsError()
        {
        }

        public ClientNotExistsError(string clientName)
        {
            Message = $"The company {clientName} does not exists!";
        }
    }
}
