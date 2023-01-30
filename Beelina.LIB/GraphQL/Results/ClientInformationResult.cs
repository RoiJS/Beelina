using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.LIB.GraphQL.Results
{
    public class ClientInformationResult : IClientInformationPayload
    {
        public string Name { get; set; } = String.Empty;
        public string DBName { get; set; } = String.Empty;
        public string DBHashName { get; set; } = String.Empty;
    }

}