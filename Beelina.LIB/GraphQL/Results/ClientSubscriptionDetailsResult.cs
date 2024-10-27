
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.LIB.GraphQL.Results
{
    public class ClientSubscriptionDetailsResult : IClientSubscriptionDetailsPayload
    {
        public int ClientId { get; set; }
        public int SubscriptionId { get; set; }
        public string SubscriptionName { get; set; }
        public int SubscriptionFeatureId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
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

        public double CurrentSubscriptionPrice { get; set; }
        public double CurrentRegisterUserAddonPrice { get; set; }
        public double CurrentCustomReportAddonPrice { get; set; }

        public List<SubscriptionFeatureHideDashboardWidget> SubscriptionFeatureHideDashboardWidgets { get; set; } = [];
        public List<SubscriptionFeatureAvailableReport> SubscriptionFeatureAvailableReports { get; set; } = [];

    }
}
