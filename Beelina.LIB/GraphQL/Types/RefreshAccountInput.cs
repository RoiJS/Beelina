namespace Beelina.LIB.GraphQL.Types
{
    public class RefreshAccountInput
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
    }
}