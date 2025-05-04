using Beelina.LIB.GraphQL.Exceptions;

namespace Beelina.LIB.GraphQL.Errors.Factories
{
    public class SubscriptionErrorFactory
         : BaseErrorFactory
    {
        public SubscriptionRegistrationAlreadyExistsError CreateErrorFrom(SubscriptionRegistrationAlreadyExistsException ex)
        {
            return new SubscriptionRegistrationAlreadyExistsError();
        }
    }
}
