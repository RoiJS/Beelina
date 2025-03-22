using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class ProductWithdrawalEntryNotExistsError
        : BaseError, IProductWithdrawalEntryPayload
    {
        public ProductWithdrawalEntryNotExistsError(int id)
        {
            Message = $"Product withdrawal entry with the id of {id} does not exists!";
        }
    }
}
