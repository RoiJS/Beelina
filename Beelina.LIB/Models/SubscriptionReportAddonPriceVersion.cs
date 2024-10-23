namespace Beelina.LIB.Models
{
    public class SubscriptionReportAddonPriceVersion
        : Entity
    {
        public int SubscriptionFeatureId { get; set; }
        public double Price { get; set; }
        public DateTime Date { get; set; }

        public SubscriptionFeature SubscriptionFeature { get; set; }
    }
}