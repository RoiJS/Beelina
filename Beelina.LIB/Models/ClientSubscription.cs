namespace Beelina.LIB.Models
{
    public class ClientSubscription
        : Entity
    {
        public int ClientId { get; set; }
        public int SubscriptionFeatureId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool Approve { get; set; } = true;

        public Client Client { get; set; }
        public SubscriptionFeature SubscriptionFeature { get; set; }
    }
}