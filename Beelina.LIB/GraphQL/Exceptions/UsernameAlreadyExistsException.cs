using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
