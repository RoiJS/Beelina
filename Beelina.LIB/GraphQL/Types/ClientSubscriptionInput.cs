namespace Beelina.LIB.GraphQL.Types
{
    public class ClientSubscriptionInput
    {
        public int Id { get; set; }
        public string ClientId { get; set; }
        public int SubscriptionFeatureId { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
    }
}
