namespace Beelina.LIB.GraphQL.Errors
{
    public class SubscriptionRegistrationAlreadyExistsError
        : BaseError
    {
        public SubscriptionRegistrationAlreadyExistsError()
        {
            Message = $"You have pending subscription registration. Please wait for it to be approved.";
        }
    }
}
