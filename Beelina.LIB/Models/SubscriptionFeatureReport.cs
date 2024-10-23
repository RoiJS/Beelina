namespace Beelina.LIB.Models
{
    public class SubscriptionFeatureAvailableReport
        : Entity
    {
        public int SubscriptionFeatureId { get; set; }
        public int ReportId { get; set; }

        public SubscriptionFeature SubscriptionFeature { get; set; }
        public Report Report { get; set; }
    }
}