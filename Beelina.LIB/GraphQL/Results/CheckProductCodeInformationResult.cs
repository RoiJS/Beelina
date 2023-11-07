using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Results
{
    public class CheckProductCodeInformationResult : IProductPayload
    {
        public bool Exists { get; set; }


        public CheckProductCodeInformationResult(bool exists)
        {
            Exists = exists;
        }
    }
}