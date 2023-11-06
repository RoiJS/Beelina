namespace Beelina.LIB.Helpers.Constants
{
    public static class ApiRoutes
    {
        public static class ClientsControllerRoutes
        {
            public const string DeleteClientURL = "/api/clients/{id}";
            public const string GetClientInformationURL = "/api/clients/{clientName}";
            public const string RegisterClientURL = "/api/clients/registerClient";
            public const string RegisterDemoURL = "/api/clients/registerDemo";
            public const string UpdateClientURL = "/api/clients/{id}";
        }

        public static class ClientDbManagerControllerRoutes
        {
            public const string PopulateDatabaseURL = "/api/clientdbmanager/populateDatabase";
            public const string SyncDatabaseURL = "/api/clientdbmanager/syncDatabase";
            public const string SyncAllDatabasesURL = "/api/clientdbmanager/syncAllDatabases";
        }

        public static class SystemDbManagerControllerRoutes
        {
            public const string SyncDatabaseURL = "/api/systemdbmanager/syncDatabase";
        }
    }
}