using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Beelina.LIB.GraphQL.Exceptions
{
    public class BaseException 
         : Exception
    {
        public string ErrorMessage { get; }

        public BaseException(string errorMessage)
        {
            ErrorMessage = errorMessage;
        }
    }
}
