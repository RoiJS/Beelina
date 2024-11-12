namespace Beelina.LIB.Models
{
    public class SubscriptionFeature
        : Entity
    {
        public int SubscriptionId { get; set; }
        public string Version { get; set; }
        public string Description { get; set; }
        public bool Custom { get; set; }
        public bool OfflineModeActive { get; set; }
        public int ProductSKUMax { get; set; }
        public bool TopProductsPageActive { get; set; }
        public int CustomerAccountsMax { get; set; }
        public int CustomersMax { get; set; }
        public bool DashboardDistributionPageActive { get; set; }
        public int OrderPrintActive { get; set; }
        public bool SendReportEmailActive { get; set; }
        public int UserAccountsMax { get; set; }
        public bool RegisterUserAddOnActive { get; set; }
        public bool CustomReportAddOnActive { get; set; }
        public Subscription Subscription { get; set; }

        public List<SubscriptionFeatureHideDashboardWidget> SubscriptionFeatureHideDashboardWidgets { get; set; } = [];
        public List<SubscriptionFeatureAvailableReport> SubscriptionFeatureAvailableReports { get; set; } = [];
        public List<SubscriptionPriceVersion> SubscriptionPriceVersions { get; set; } = [];
        public List<SubscriptionRegisterUserAddonPriceVersion> SubscriptionRegisterUserAddonPriceVersions { get; set; } = [];
        public List<SubscriptionReportAddonPriceVersion> SubscriptionReportAddonPriceVersions { get; set; } = [];

    }
}