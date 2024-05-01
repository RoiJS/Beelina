using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Helpers.Class;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RestSharp;

namespace Beelina.LIB.BusinessLogic
{
    public class ClientDbManagerRepository
        : BaseRepository<IEntity>, IClientDbManagerRepository<IEntity>
    {
        private readonly IOptions<AppHostInfo> _appHostInfo;
        private readonly IOptions<ApplicationSettings> _applicationSettings;

        public ClientDbManagerRepository(
            IBeelinaRepository<IEntity> beelinaRepository,
            IOptions<AppHostInfo> appHostInfo,
            IOptions<ApplicationSettings> applicationSettings)
            : base(beelinaRepository, beelinaRepository.SystemDbContext)
        {
            _appHostInfo = appHostInfo;
            _applicationSettings = applicationSettings;
        }

        public async Task SyncAllClientDatabases()
        {
            var activeDatabases = await _beelinaRepository.SystemDbContext.Clients
                .Where(a => a.IsActive == true && a.IsDelete == false)
                .ToListAsync();

            foreach (var db in activeDatabases)
            {
                await SendRequestToSyncDatabase(db);
            }
        }

        private async Task SendRequestToSyncDatabase(Client client)
        {
            try
            {
                var url = String.Format("{0}{1}", _appHostInfo.Value.APIDomain, _applicationSettings.Value.AppSettingsURL.SyncDatabaseURL);
                var httpClient = new RestClient(url);
                httpClient.Options.MaxTimeout = -1;
                var httpRequest = new RestRequest(url, Method.Post);
                httpRequest.AddHeader("App-Secret-Token", client.DBHashName);
                httpRequest.AddHeader("Content-Type", "application/json");
                await httpClient.ExecuteAsync(httpRequest);
            }
            catch (Exception exception)
            {
                throw new Exception(exception.Message);
            }
        }
    }
}