import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';

import { ClientSubscriptionDetails } from 'src/app/_models/client-subscription-details.model';
import { SubscriptionFeatureHideDashboardWidget } from 'src/app/_models/subscription-feature-hide-dashboard-widget.model';
import { SubscriptionFeatureAvailableReport } from 'src/app/_models/subscription-feature-available-report.model';

@Injectable({
  providedIn: 'root'
})
export class LocalClientSubscriptionDbService {

  private localDbService = inject(NgxIndexedDBService);
  monitorClientSubscriptionChanges = new BehaviorSubject<boolean>(false);
  monitorSubscriptionFeatureAvailableReportsChanges = new BehaviorSubject<boolean>(false);
  monitorSubscriptionFeatureHideDashboardWidgetsChanges = new BehaviorSubject<boolean>(false);

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
      clientSubscription.allowExceedUserAccountsMax = currentClientSubscriptionDetailsResult.allowExceedUserAccountsMax;
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
      const saveClientSubscriptions = async () => {
        await firstValueFrom(this.localDbService.clear('clientSubscription'));
        await firstValueFrom(this.localDbService.add('clientSubscription', clientSubscription));
        this.monitorClientSubscriptionChanges.next(true);
        console.log('Saved local client subscriptions.');
      }

      const saveSubscriptionFeatureAvailableReports = async () => {
        await firstValueFrom(this.localDbService.clear('subscriptionFeatureAvailableReports'));
        await firstValueFrom(this.localDbService.bulkAdd('subscriptionFeatureAvailableReports', clientSubscription.subscriptionFeatureAvailableReports));
        this.monitorSubscriptionFeatureAvailableReportsChanges.next(true);
        console.log('Saved local client subscription feature available reports.');
      }

      const saveSubscriptionFeatureHideDashboardWidgets = async () => {
        await firstValueFrom(this.localDbService.clear('subscriptionFeatureHideDashboardWidgets'));
        await firstValueFrom(this.localDbService.bulkAdd('subscriptionFeatureHideDashboardWidgets', clientSubscription.subscriptionFeatureHideDashboardWidgets));
        this.monitorSubscriptionFeatureHideDashboardWidgetsChanges.next(true);
        console.log('Saved local client subscription feature hide dashboard widgets.');
      }

      const currentClientSubscriptions = await this.getLocalClientSubsription();

      if (!currentClientSubscriptions) {
        await saveClientSubscriptions();
        await saveSubscriptionFeatureAvailableReports();
        await saveSubscriptionFeatureHideDashboardWidgets();
        return;
      }

      if (clientSubscription.subscriptionId !== currentClientSubscriptions.subscriptionId ||
        clientSubscription.subscriptionName !== currentClientSubscriptions.subscriptionName ||
        clientSubscription.subscriptionFeatureId !== currentClientSubscriptions.subscriptionFeatureId ||
        clientSubscription.startDate !== currentClientSubscriptions.startDate ||
        clientSubscription.endDate !== currentClientSubscriptions.endDate ||
        clientSubscription.offlineModeActive !== currentClientSubscriptions.offlineModeActive ||
        clientSubscription.productSKUMax !== currentClientSubscriptions.productSKUMax ||
        clientSubscription.topProductsPageActive !== currentClientSubscriptions.topProductsPageActive ||
        clientSubscription.customerAccountsMax !== currentClientSubscriptions.customerAccountsMax ||
        clientSubscription.customersMax !== currentClientSubscriptions.customersMax ||
        clientSubscription.dashboardDistributionPageActive !== currentClientSubscriptions.dashboardDistributionPageActive ||
        clientSubscription.orderPrintActive !== currentClientSubscriptions.orderPrintActive ||
        clientSubscription.sendReportEmailActive !== currentClientSubscriptions.sendReportEmailActive ||
        clientSubscription.allowExceedUserAccountsMax !== currentClientSubscriptions.allowExceedUserAccountsMax ||
        clientSubscription.userAccountsMax !== currentClientSubscriptions.userAccountsMax ||
        clientSubscription.registerUserAddOnActive !== currentClientSubscriptions.registerUserAddOnActive ||
        clientSubscription.customReportAddOnActive !== currentClientSubscriptions.customReportAddOnActive ||
        clientSubscription.currentSubscriptionPrice !== currentClientSubscriptions.currentSubscriptionPrice ||
        clientSubscription.currentRegisterUserAddonPrice !== currentClientSubscriptions.currentRegisterUserAddonPrice ||
        clientSubscription.currentCustomReportAddonPrice !== currentClientSubscriptions.currentCustomReportAddonPrice
      ) {
        await saveClientSubscriptions();
      }

      const subscriptionFeatureAvailableReportsFromDb = <Array<SubscriptionFeatureAvailableReport>>await firstValueFrom(this.localDbService.getAll('subscriptionFeatureAvailableReports'));
      if (subscriptionFeatureAvailableReportsFromDb.length !== clientSubscription.subscriptionFeatureAvailableReports.length) {
        await saveSubscriptionFeatureAvailableReports();
      }

      const subscriptionFeatureHideDashboardWidgetsFromDb = <Array<SubscriptionFeatureHideDashboardWidget>>await firstValueFrom(this.localDbService.getAll('subscriptionFeatureHideDashboardWidgets'));
      if (subscriptionFeatureHideDashboardWidgetsFromDb.length !== clientSubscription.subscriptionFeatureHideDashboardWidgets.length) {
        await saveSubscriptionFeatureHideDashboardWidgets();
      }
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
