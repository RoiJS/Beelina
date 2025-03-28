using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Results
{
    public class CheckPurchaseOrderCodeInformationResult : IPurchaseOrderPayload
    {
        public bool Exists { get; set; }


        public CheckPurchaseOrderCodeInformationResult(bool exists)
        {
            Exists = exists;
        }
    }
}