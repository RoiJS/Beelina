namespace Beelina.LIB.Models
{
    public class Subscription
        : Entity
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public List<SubscriptionFeature> SubscriptionFeatures { get; set; }
    }
}