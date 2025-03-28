namespace Beelina.LIB.Models
{
    public class SubscriptionRegisterUserAddonPriceVersion
        : Entity
    {
        public int SubscriptionFeatureId { get; set; }
        public double Price { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public SubscriptionFeature SubscriptionFeature { get; set; }
    }
}