using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace Beelina.LIB.Models
{
    public class RefreshToken : Entity
    {
        public string Token { get; set; } = String.Empty;
        public DateTime ExpirationDate { get; set; }
        public int UserAccountId { get; set; }
        public UserAccount UserAccount { get; set; }
    }
}
