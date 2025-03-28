namespace Beelina.LIB.GraphQL.Exceptions
{
    public class ProductWithdrawalNotExistsException
        : Exception
    {
        
        public int ProductWithdrawalId { get; }
        public ProductWithdrawalNotExistsException(int productWithdrawalId)
        {
            ProductWithdrawalId = productWithdrawalId;
        }
    }
}
