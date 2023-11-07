using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class UserAccountNotExistsError
        : BaseError, IUserAccountPayload
    {
        public UserAccountNotExistsError()
        {
            Message = "User Account does not exists!";
        }
    }
}
