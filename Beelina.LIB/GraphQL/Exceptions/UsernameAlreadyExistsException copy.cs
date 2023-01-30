namespace Beelina.LIB.GraphQL.Exceptions
{
    public class ClientNotExistsException
        : Exception
    {
        public string ClientName { get; set; }

        public ClientNotExistsException(string clientName)
        {
            ClientName = clientName;
        }
    }
}
