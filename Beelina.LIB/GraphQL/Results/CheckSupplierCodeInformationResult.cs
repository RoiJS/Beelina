using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Results
{
    public class CheckSupplierCodeInformationResult : ISupplierPayload
    {
        public bool Exists { get; set; }

        public CheckSupplierCodeInformationResult(bool exists)
        {
            Exists = exists;
        }
    }
}