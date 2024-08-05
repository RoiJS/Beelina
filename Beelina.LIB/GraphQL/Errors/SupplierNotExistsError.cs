using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class SupplierNotExistsError
        : BaseError, ISupplierPayload
    {
        public SupplierNotExistsError(int supplierId)
        {
            Message = $"Supplier with the id of {supplierId} does not exists!";
        }
    }
}
