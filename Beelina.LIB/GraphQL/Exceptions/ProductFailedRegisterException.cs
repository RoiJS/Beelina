namespace Beelina.LIB.GraphQL.Exceptions
{
    public class ProductFailedRegisterException
        : Exception
    {
        public string ProductName { get; }
        public ProductFailedRegisterException(string productName)
        {
            ProductName = productName;
        }
    }
}
