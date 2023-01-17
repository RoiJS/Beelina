namespace Beelina.LIB.GraphQL.Errors
{
    public class BaseError
    {
        public string Message { get; set; }

        public BaseError()
        {

        }

        public BaseError(string message)
        {
            Message = message;
        }
    }
}
