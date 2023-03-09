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
