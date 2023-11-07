using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Results
{
    public class CheckUsernameInformationResult : IUserAccountPayload
    {
        public bool Exists { get; set; }


        public CheckUsernameInformationResult(bool exists)
        {
            Exists = exists;
        }
    }
}