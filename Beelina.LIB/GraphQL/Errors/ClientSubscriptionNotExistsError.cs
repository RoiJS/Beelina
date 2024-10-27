using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class ClientSubscriptionNotExistsError
        : BaseError, IClientSubscriptionDetailsPayload
    {
        public ClientSubscriptionNotExistsError()
        {
        }

        public ClientSubscriptionNotExistsError(string message)
        {
            Message = message;
        }
    }
}
