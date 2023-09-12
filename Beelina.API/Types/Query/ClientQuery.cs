using AutoMapper;
using Beelina.LIB.GraphQL.Errors;
using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class ClientQuery
    {
        public async Task<IClientInformationPayload> GetClientInformation(
            [Service] IClientRepository<Client> clientRepository,
            [Service] IMapper mapper,
            string clientName)
        {
            var clientFromRepo = await clientRepository.GetCompanyInfoByName(clientName);

            var clientResult = mapper.Map<ClientInformationResult>(clientFromRepo);

            if (clientFromRepo == null)
            {
                return new ClientNotExistsError(clientName);
            }

            return clientResult;
        }
    }
}