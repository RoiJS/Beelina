import { SubscriptionFeatureAvailableReport } from "./subscription-feature-available-report.model";
import { SubscriptionFeatureHideDashboardWidget } from "./subscription-feature-hide-dashboard-widget.model";

export class ClientSubscriptionDetails {
  clientId: number;
  subscriptionId: number;
  subscriptionName: string;
  subscriptionFeatureId: number;
  startDate: Date;
  endDate?: Date;
  offlineModeActive: boolean;
  productSkuMax: number;
  topProductsPageActive: boolean;
  customerAccountsMax: number;
  customersMax: number;
  dashboardDistributionPageActive: boolean;
  orderPrintActive: number;
  sendReportEmailActive: boolean;
  userAccountsMax: number;
  registerUserAddOnActive: boolean;
  customReportAddOnActive: boolean;
  currentSubscriptionPrice: number;
  currentRegisterUserAddonPrice: number;
  currentCustomReportAddonPrice: number;
  subscriptionFeatureHideDashboardWidgets: SubscriptionFeatureHideDashboardWidget[] = [];
  subscriptionFeatureAvailableReports: SubscriptionFeatureAvailableReport[] = [];
}
