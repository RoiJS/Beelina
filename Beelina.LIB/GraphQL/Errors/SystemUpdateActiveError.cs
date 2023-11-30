namespace Beelina.LIB.GraphQL.Errors
{
    public class SystemUpdateActiveError
        : BaseError
    {
        public SystemUpdateActiveError()
        {
            Message = "System is locked and currently undergoing maintenance. Please comeback later.";
        }
    }
}
