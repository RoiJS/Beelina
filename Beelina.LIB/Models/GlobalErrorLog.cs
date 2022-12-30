namespace Beelina.LIB.Models
{
    public class GlobalErrorLog : Entity
    {
        public string Message { get; set; }
        public string Stacktrace { get; set; }
        public string Source { get; set; }
        public int ClientId { get; set; }
        public Client Client { get; set; }
    }
}
