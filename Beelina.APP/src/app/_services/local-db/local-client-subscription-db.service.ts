import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';

import { ClientSubscriptionDetails } from 'src/app/_models/client-subscription-details.model';
import { SubscriptionFeatureHideDashboardWidget } from 'src/app/_models/subscription-feature-hide-dashboard-widget.model';
import { SubscriptionFeatureAvailableReport } from 'src/app/_models/subscription-feature-available-report.model';

@Injectable({
  providedIn: 'root'
})
export class LocalClientSubscriptionDbService {

  private localDbService = inject(NgxIndexedDBService);

  async getLocalClientSubsription() {
    const currentClientSubscriptionDetailsFromLocalDb = <Array<ClientSubscriptionDetails>>await firstValueFrom(this.localDbService.getAll('clientSubscription'));

    if (currentClientSubscriptionDetailsFromLocalDb && currentClientSubscriptionDetailsFromLocalDb.length > 0) {
      const currentClientSubscriptionDetailsResult = currentClientSubscriptionDetailsFromLocalDb[0];

      const clientSubscription = new ClientSubscriptionDetails();
      clientSubscription.clientId = currentClientSubscriptionDetailsResult.clientId;
      clientSubscription.subscriptionId = currentClientSubscriptionDetailsResult.subscriptionId;
      clientSubscription.subscriptionName = currentClientSubscriptionDetailsResult.subscriptionName;
      clientSubscription.subscriptionFeatureId = currentClientSubscriptionDetailsResult.subscriptionFeatureId;
      clientSubscription.startDate = currentClientSubscriptionDetailsResult.startDate;
      clientSubscription.endDate = currentClientSubscriptionDetailsResult.endDate;
      clientSubscription.offlineModeActive = currentClientSubscriptionDetailsResult.offlineModeActive;
      clientSubscription.productSKUMax = currentClientSubscriptionDetailsResult.productSKUMax;
      clientSubscription.topProductsPageActive = currentClientSubscriptionDetailsResult.topProductsPageActive;
      clientSubscription.customerAccountsMax = currentClientSubscriptionDetailsResult.customerAccountsMax;
      clientSubscription.customersMax = currentClientSubscriptionDetailsResult.customersMax;
      clientSubscription.dashboardDistributionPageActive = currentClientSubscriptionDetailsResult.dashboardDistributionPageActive;
      clientSubscription.orderPrintActive = currentClientSubscriptionDetailsResult.orderPrintActive;
      clientSubscription.sendReportEmailActive = currentClientSubscriptionDetailsResult.sendReportEmailActive;
      clientSubscription.userAccountsMax = currentClientSubscriptionDetailsResult.userAccountsMax;
      clientSubscription.registerUserAddOnActive = currentClientSubscriptionDetailsResult.registerUserAddOnActive;
      clientSubscription.customReportAddOnActive = currentClientSubscriptionDetailsResult.customReportAddOnActive;
      clientSubscription.currentSubscriptionPrice = currentClientSubscriptionDetailsResult.currentSubscriptionPrice;
      clientSubscription.currentRegisterUserAddonPrice = currentClientSubscriptionDetailsResult.currentRegisterUserAddonPrice;
      clientSubscription.currentCustomReportAddonPrice = currentClientSubscriptionDetailsResult.currentCustomReportAddonPrice;

      const subscriptionFeatureAvailableReportsFromDb = <Array<SubscriptionFeatureAvailableReport>>await firstValueFrom(this.localDbService.getAll('subscriptionFeatureAvailableReports'));
      if (subscriptionFeatureAvailableReportsFromDb && subscriptionFeatureAvailableReportsFromDb.length > 0) {
        subscriptionFeatureAvailableReportsFromDb.forEach(element => {
          clientSubscription.subscriptionFeatureAvailableReports.push(element);
        });
      };

      const subscriptionFeatureHideDashboardWidgetsFromDb = <Array<SubscriptionFeatureHideDashboardWidget>>await firstValueFrom(this.localDbService.getAll('subscriptionFeatureHideDashboardWidgets'));
      if (subscriptionFeatureHideDashboardWidgetsFromDb && subscriptionFeatureHideDashboardWidgetsFromDb.length > 0) {
        subscriptionFeatureHideDashboardWidgetsFromDb.forEach(element => {
          clientSubscription.subscriptionFeatureHideDashboardWidgets.push(element);
        });
      };

      return clientSubscription;
    }

    return null;
  }

  async saveClientSubscriptionSettings(clientSubscription: ClientSubscriptionDetails) {
    try {
      await this.clear();
      await firstValueFrom(this.localDbService.add('clientSubscription', clientSubscription));
      await firstValueFrom(this.localDbService.bulkAdd('subscriptionFeatureHideDashboardWidgets', clientSubscription.subscriptionFeatureHideDashboardWidgets));
      await firstValueFrom(this.localDbService.bulkAdd('subscriptionFeatureAvailableReports', clientSubscription.subscriptionFeatureAvailableReports));
      console.log('Saved local client subscriptions.');
    } catch (error) {
      console.error(error);
    }
  }

  async clear() {
    try {
      await firstValueFrom(this.localDbService.clear('clientSubscription'));
      await firstValueFrom(this.localDbService.clear('subscriptionFeatureHideDashboardWidgets'));
      await firstValueFrom(this.localDbService.clear('subscriptionFeatureAvailableReports'));
      console.log('Cleared local client subscriptions.');
    } catch (error) {
      console.error(error);
    }
  }
}
