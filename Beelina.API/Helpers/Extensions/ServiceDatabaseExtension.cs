using Beelina.LIB.DbContexts;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Beelina.API.Helpers.Extensions
{
    public static class ServiceDatabaseExtension
    {

        public static void RegisterDatabaseService(this IServiceCollection services, ConfigurationManager configuration)
        {
            services.AddDbContext<BeelinaDataContext>(x => x.UseSqlServer(configuration.GetConnectionString("BeelinaDBConnection")), ServiceLifetime.Transient);

            var ActivateEFMigration = Convert.ToBoolean(configuration.GetSection("AppSettings:GeneralSettings:ActivateEFMigration").Value);

            if (ActivateEFMigration)
            {
                services.AddDbContext<BeelinaClientDataContext>(
                    x => x.UseSqlServer(configuration.GetConnectionString("BeelinaClientDeveloperDBConnection"))
                );
            }
            else
            {
                // This section performs dynamic setting up of connection string for each http request.
                // Getting the database name based on the App-Secret-Token header which is the encrypted version
                // of the database name.
                services.AddTransient<IHttpContextAccessor, HttpContextAccessor>();
                services.AddSingleton<IMemoryCache, MemoryCache>();
                services.AddDbContext<BeelinaClientDataContext>((serviceProvider, options) =>
                {
                    var httpContext = serviceProvider.GetService<IHttpContextAccessor>()?.HttpContext;
                    var systemDataContext = serviceProvider.GetService<BeelinaDataContext>();
                    var memoryCache = serviceProvider.GetService<IMemoryCache>();

                    // Get the encrypted App-Secret-Token header
                    var appSecretToken = httpContext?.Request.Headers["App-Secret-Token"].ToString();

                    // If app secret token is not provided, it is always assume that the request is going to ReserbizDataContext
                    if (!String.IsNullOrEmpty(appSecretToken))
                    {
                        // Get the client information based on the app secret token
                        // Check if the dbhashname is in the cache, if not, try to get it from the database

                        if (!memoryCache.TryGetValue<Client>(appSecretToken, out var clientInfo))
                        {
                            // If the dbhashname is not in the cache, retrieve it from the database
                            clientInfo = systemDataContext?.Clients.FirstOrDefault(c => c.DBHashName == appSecretToken);

                            memoryCache?.Set(appSecretToken, clientInfo, TimeSpan.FromMinutes(30));
                        }

                        if (clientInfo == null)
                            throw new Exception("Invalid App secret token. Please make sure that the app secret token you have provided is valid.");

                        var forIntegrationTest = httpContext?.Request.Headers["For-Integration-Test"].ToString();

                        // Format and configure connection string for the current http request.
                        var clientConnectionString = String.Format(configuration.GetConnectionString("BeelinaClientDBTemplateConnection"), clientInfo?.DBServer, clientInfo?.DBName, clientInfo?.DBusername, clientInfo?.DBPassword);

                        if (!String.IsNullOrEmpty(forIntegrationTest))
                        {
                            clientConnectionString = configuration.GetConnectionString("BeelinaClientIntegrationTestDBTemplateConnection");
                        }

                        options.UseSqlServer(clientConnectionString);
                    }

                }, ServiceLifetime.Transient);
            }
        }
    }
}