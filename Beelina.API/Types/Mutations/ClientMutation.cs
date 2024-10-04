using Beelina.LIB.DbContexts;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class ClientMutation
    {
        public async Task<Client> RegisterClient(
            [Service] ILogger<ClientMutation> logger,
            [Service] IClientRepository<Client> clientRepository,
            [Service] IOptions<DbUserAccountDefaultsSettings> dbUserAccountDefaultSettings,
            ClientInput client)
        {
            try
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

                logger.LogInformation("Successfully created new client information. Params: {@params}", createdClient);
                return createdClient;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to create client information. Params: {@params}", client);

                throw new Exception($"Failed to create client information. {ex.Message}");
            }

        }

        public async Task<ISyncDatabasePayload> SyncDatabase(
            [Service] ILogger<ClientMutation> logger,
            [Service] BeelinaClientDataContext _context
        )
        {
            try
            {
                await _context.Database.MigrateAsync();
                logger.LogInformation("Successfully sync database.");
                return new SyncDatabaseResult() { DatabaseSynced = true };
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to sync database.");

                throw new Exception($"Failed to sync database. {ex.Message}");
            }

        }
    }
}
