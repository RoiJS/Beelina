namespace Beelina.LIB.GraphQL.Exceptions
{
    public class UsernameAlreadyExistsException
        : Exception
    {
        public string Username { get; set; }

        public UsernameAlreadyExistsException(string username)
        {
            Username = username;
        }
    }
}
