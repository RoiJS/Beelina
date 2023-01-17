using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Beelina.LIB.GraphQL.Types
{
    public class ClientInput
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }
        public string ContactNumber { get; set; }
        public bool AutoSendEmail { get; set; } = true;
    }


}
