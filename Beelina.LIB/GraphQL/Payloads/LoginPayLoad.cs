namespace Beelina.LIB.GraphQL.Payloads
{
    public class AuthenticationPayLoad
    {
        public string AccessToken { get; set; }
        public DateTime? ExpiresIn { get; set; }
        public string RefreshToken { get; set; }
    }
}
