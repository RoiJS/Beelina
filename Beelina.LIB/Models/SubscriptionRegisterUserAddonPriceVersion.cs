namespace Beelina.LIB.Models
{
    public class SubscriptionRegisterUserAddonPriceVersion
        : Entity
    {
        public int SubscriptionFeatureId { get; set; }
        public double Price { get; set; }
        public DateTime Date { get; set; }

        public SubscriptionFeature SubscriptionFeature { get; set; }
    }
}