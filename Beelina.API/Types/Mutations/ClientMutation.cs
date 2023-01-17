using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.Extensions.Options;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class ClientMutation
    {
        public async Task<Client> RegisterClient(
            [Service] IClientRepository<Client> clientRepository,
            [Service] IOptions<DbUserAccountDefaultsSettings> dbUserAccountDefaultSettings,
            ClientInput client)
        {
            var clientToCreate = new Client
            {
                Name = client.Name,
                Type = ClientTypeEnum.Regular,
                Description = client.Description,
                ContactNumber = client.ContactNumber,
                DateJoined = DateTime.Now,
                DBServer = dbUserAccountDefaultSettings.Value.DbServer,
                DBusername = dbUserAccountDefaultSettings.Value.DbUsername,
                DBPassword = dbUserAccountDefaultSettings.Value.DbPassword,
            };

            var userAccount = new UserAccount
            {
                FirstName = client.FirstName,
                MiddleName = client.MiddleName,
                LastName = client.LastName,
                EmailAddress = client.EmailAddress
            };

            // Save client information
            var createdClient = await clientRepository.RegisterClient(clientToCreate);

            return createdClient;
        }
    }
}
