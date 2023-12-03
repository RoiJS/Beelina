using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class ProductStockAuditNotExistsError
        : BaseError, IProductPayload
    {
        public ProductStockAuditNotExistsError(int id)
        {
            Message = $"Product Stock Audit with id of {id} does not exists!";
        }
    }
}
