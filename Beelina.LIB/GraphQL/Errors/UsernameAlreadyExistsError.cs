namespace Beelina.LIB.GraphQL.Errors
{
    public class UsernameAlreadyExistsError
        : BaseError
    {
        public UsernameAlreadyExistsError(string username)
        {
            Message = $"The username {username} already exists!";
        }
    }
}
