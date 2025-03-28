namespace Beelina.LIB.Models
{
    public class SubscriptionFeatureHideDashboardWidget
        : Entity
    {
        public int SubscriptionFeatureId { get; set; }
        public int DashboardModuleWidgetId { get; set; }

        public DashboardModuleWidget DashboardModuleWidget { get; set; }
    }
}