using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Results
{
    public class CheckProductWithdrawalCodeInformationResult : IProductWithdrawalPayload
    {
        public bool Exists { get; set; }


        public CheckProductWithdrawalCodeInformationResult(bool exists)
        {
            Exists = exists;
        }
    }
}