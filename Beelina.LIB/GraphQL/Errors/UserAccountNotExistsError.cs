namespace Beelina.LIB.GraphQL.Errors
{
    public class UserAccountNotExistsError
        : BaseError
    {
        public UserAccountNotExistsError()
        {
            Message = "User Account does not exists!";
        }
    }
}
