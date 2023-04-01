using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Results
{
    public class SyncDatabaseResult :  ISyncDatabasePayload
    {
        public bool DatabaseSynced { get; set; }
    }
}