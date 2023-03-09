namespace Beelina.LIB.GraphQL.Errors
{
    public class InvalidRefreshTokenError
        : BaseError
    {
        public InvalidRefreshTokenError()
        {
            Message = "User Account does not exists!";
        }
    }
}
