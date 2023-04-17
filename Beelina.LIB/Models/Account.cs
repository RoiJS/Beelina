using Beelina.LIB.Models;

namespace Beelina.LIB.Models
{
    public class Account : Person
    {
        public string EmailAddress { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}