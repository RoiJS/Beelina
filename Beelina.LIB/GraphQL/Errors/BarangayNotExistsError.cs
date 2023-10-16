using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class BarangayNotExistsError
        : BaseError, IBarangayPayload
    {
        public BarangayNotExistsError(int barangayId)
        {
            Message = $"Barangay with the id of {barangayId} does not exists!";
        }
    }
}
