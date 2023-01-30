using Beelina.LIB.Enums;
using Beelina.LIB.Helpers;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Beelina.LIB.BusinessLogic
{
    public class ClientRepository
        : BaseRepository<Client>, IClientRepository<Client>
    {
        private readonly IOptions<ApplicationSettings> _appSettings;

        public ClientRepository(
                IBeelinaRepository<Client> beelinaRepository,
                IOptions<ApplicationSettings> appSettings
            )
            : base(beelinaRepository, beelinaRepository.SystemDbContext)
        {
            _appSettings = appSettings;
        }

        public async Task<Client> RegisterClient(Client client)
        {
            client.DBName = GenerateClientDbName(client);

            return await RegisterClientInformation(client);
        }

        public async Task<Client> RegisterDemo(Client client)
        {
            client.DBName = await GenerateDemoDbName(client);

            return await RegisterClientInformation(client);
        }

        public async Task<Client> GetCompanyInfoByName(string companyName)
        {
            var companyInfo = await _beelinaRepository.SystemDbContext.Clients.FirstOrDefaultAsync(c => c.Name == companyName);

            return companyInfo;
        }

        private void CreateHashDBName(string dbName, out string dbHashName)
        {
            dbHashName = SystemUtility.EncryptionUtility.Encrypt(dbName);
        }

        private async Task<string> GenerateDemoDbName(Client client)
        {
            var demoDbName = "demo";
            var demoDBNameId = 1;
            var lastDemoDatabase = await _beelinaRepository.SystemDbContext.Clients
                                        .Where(c => c.Type == ClientTypeEnum.Demo)
                                        .OrderByDescending(c => c.Id)
                                        .FirstOrDefaultAsync();

            if (lastDemoDatabase != null)
            {
                // demoDBNameId = Convert.ToInt32(lastDemoDatabase.DBName.Substring(4));
                demoDBNameId = Convert.ToInt32(lastDemoDatabase.DBName.Split("_")[2].Substring(4));
                demoDBNameId += 1;
            }

            var finalDemoName = String.Format("{0}{1}{2}", _appSettings.Value.GeneralSettings.DatabasePrefix, demoDbName, demoDBNameId);

            return finalDemoName;
        }

        private string GenerateClientDbName(Client client)
        {
            var clientDbName = client.Name
                                    .Replace(" ", "")
                                    .Replace("-", "");


            clientDbName = clientDbName.ToLower();

            clientDbName = String.Format("{0}{1}", _appSettings.Value.GeneralSettings.DatabasePrefix, clientDbName);

            return clientDbName;
        }

        private async Task<Client> RegisterClientInformation(Client client)
        {
            string dbHashName;

            CreateHashDBName(client.DBName, out dbHashName);

            client.DBHashName = dbHashName;

            await AddEntity(client);

            return client;
        }
    }
}
