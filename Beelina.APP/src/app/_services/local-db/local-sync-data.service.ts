import { inject, Injectable } from '@angular/core';

import { AuthService } from '../auth.service';
import { LocalProductsDbService } from './local-products-db.service';
import { LocalCustomerAccountsDbService } from './local-customer-accounts-db.service';
import { LocalCustomerStoresDbService } from './local-customer-stores-db.service';
import { LocalPaymentMethodsDbService } from './local-payment-methods-db.service';
import { LocalOrdersDbService } from './local-orders-db.service';

import { User } from 'src/app/_models/user.model';
import { NetworkService } from '../network.service';

@Injectable({
  providedIn: 'root'
})
export class LocalSyncDataService {

  authService = inject(AuthService);
  localProductsDbService = inject(LocalProductsDbService);
  localCustomerAccountsDbService = inject(LocalCustomerAccountsDbService);
  localCustomerStoresDbService = inject(LocalCustomerStoresDbService);
  localPaymentMethodsDbService = inject(LocalPaymentMethodsDbService);
  localOrdersDbService = inject(LocalOrdersDbService);
  networkService = inject(NetworkService);

  constructor() { }

  /**
   * Synchronizes products from server to local database.
   *
   * This is called when the user logs in and when the products page is loaded.
   * It will also refresh the products every 30 minutes while the application is running.
   *
   * If the application goes offline and comes back online, this will also be called again.
   */
  async syncProducts() {
    console.info('Init syncing products..');
    await this.localProductsDbService.getProductUnitsFromServer();
    await this.localProductsDbService.getProductsFromServer();
    console.info('Product Synced');

    setInterval(async () => {

      // Sync only if online
      if (this.networkService.isOnline.value) {
        console.info('Clearing local copy of products..');
        await this.localProductsDbService.clear();

        console.info('Syncing local copy of products..');
        await this.localProductsDbService.getProductUnitsFromServer();
        await this.localProductsDbService.getProductsFromServer();
        console.info('Synced local copy of products..');
      }
    }, 30 * 60 * 1000); // 30 mins
  }

  async initSyncData() {
    this.authService.user.subscribe(async (user: User) => {
      if (!user) return;
      await this.syncProducts();
      await this.localCustomerAccountsDbService.getCustomerAccountsFromServer();
      await this.localCustomerStoresDbService.getCustomerStoresFromServer();
      await this.localPaymentMethodsDbService.getPaymentMethodsFromServer();
    });

  }

  async clearLocalData() {
    await this.localProductsDbService.clear();
    await this.localCustomerAccountsDbService.clear();
    await this.localCustomerStoresDbService.clear();
    await this.localPaymentMethodsDbService.clear();
  }

}
