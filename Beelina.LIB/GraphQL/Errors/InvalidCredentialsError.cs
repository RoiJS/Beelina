namespace Beelina.LIB.GraphQL.Errors
{
    public class InvalidCredentialsError
        : BaseError
    {
        public InvalidCredentialsError()
        {
            Message = "Invalid username or password!";
        }
    }
}
