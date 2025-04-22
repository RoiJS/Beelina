import { NumberFormatter } from "../_helpers/formatters/number-formatter.helper";
import { SubscriptionFeatureAvailableReport } from "./subscription-feature-available-report.model";
import { SubscriptionFeatureHideDashboardWidget } from "./subscription-feature-hide-dashboard-widget.model";

export class ClientSubscriptionDetails {
  clientId: number;
  subscriptionId: number;
  subscriptionName: string;
  description: string;
  subscriptionFeatureId: number;
  startDate: Date;
  endDate?: Date;
  offlineModeActive: boolean;
  productSKUMax: number;
  topProductsPageActive: boolean;
  customerAccountsMax: number;
  customersMax: number;
  dashboardDistributionPageActive: boolean;
  orderPrintActive: boolean;
  sendReportEmailActive: boolean;
  allowExceedUserAccountsMax: boolean;
  userAccountsMax: number;
  registerUserAddOnActive: boolean;
  customReportAddOnActive: boolean;
  currentSubscriptionPrice: number;
  currentRegisterUserAddonPrice: number;
  currentCustomReportAddonPrice: number;
  subscriptionFeatureHideDashboardWidgets: SubscriptionFeatureHideDashboardWidget[] = [];
  subscriptionFeatureAvailableReports: SubscriptionFeatureAvailableReport[] = [];

  get formattedCurrentSubscriptionPrice() {
    return NumberFormatter.formatCurrency(this.currentSubscriptionPrice);
  }
}
