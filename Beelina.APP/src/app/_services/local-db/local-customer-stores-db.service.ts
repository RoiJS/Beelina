import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { CustomerStoreService } from '../customer-store.service';
import { LocalBaseDbService } from './local-base-db.service';

import { CustomerStore } from 'src/app/_models/customer-store';
import { LocalCustomerStore } from 'src/app/_models/local-db/local-customer-store.model';

import { getOutletTypeEnum } from 'src/app/_enum/outlet-type.enum';

import { PaymentMethod } from 'src/app/_models/payment-method';
import { Barangay } from 'src/app/_models/barangay';

@Injectable({
  providedIn: 'root'
})
export class LocalCustomerStoresDbService extends LocalBaseDbService {

  private customerStoreService = inject(CustomerStoreService);

  async getCustomerStoresFromServer() {
    const customerStoresCount = <number>await firstValueFrom(this.localDbService.count('customers'));
    if (customerStoresCount > 0) return;

    const allCustomerStores = await firstValueFrom(this.customerStoreService.getAllCustomerStores());

    const customerUserId = await this.getCustomerUserId();
    const localCustomerStores = allCustomerStores.map(c => {
      const localCustomerStore = new LocalCustomerStore();
      localCustomerStore.customerUserId = customerUserId;
      localCustomerStore.customerId = c.id;
      localCustomerStore.name = c.name;
      localCustomerStore.address = c.address;
      localCustomerStore.emailAddress = c.emailAddress;
      localCustomerStore.outletType = getOutletTypeEnum(c.outletType);
      localCustomerStore.paymentMethodId = c.paymentMethod.id;
      localCustomerStore.barangayId = c.barangay.id;
      return localCustomerStore;
    });

    const newCustomers = await firstValueFrom(this.localDbService.bulkAdd('customers', localCustomerStores));
    console.info('newCustomersCount: ', newCustomers.length);
  }

  async getMyLocalCustomerStores(storeIds: Array<number> = null): Promise<Array<CustomerStore>> {
    const customerUserId = await this.getCustomerUserId();
    const localCustomerStoresFromLocalDb = <Array<LocalCustomerStore>>await firstValueFrom(this.localDbService.getAll('customers'));
    let myLocalCustomers = localCustomerStoresFromLocalDb.filter(c => c.customerUserId == customerUserId);

    if (storeIds !== null) {
      myLocalCustomers = myLocalCustomers.filter(c => storeIds.includes(c.customerId));
    }

    const customerStores = await Promise.all(myLocalCustomers.map(async (lcs: LocalCustomerStore) => {
      return await this.buildCustomerStore(lcs, customerUserId);
    }));

    return customerStores;
  }

  async getMyLocalCustomerStore(storeId: number): Promise<CustomerStore | null> {
    const customerUserId = await this.getCustomerUserId();

    // NOTE: For some reason the logic is slower when in offline mode. There is a slight improvement when using getByIndex instead of getAllByIndex but
    // the trade-off is that there is a chance that the local customer store with the same customer id from other user accounts will be returned.
    // This is not a problem for now since the customer user id is unique per user account.

    // const localCustomerStoresFromLocalDb = <Array<LocalCustomerStore>>await firstValueFrom(this.localDbService.getAll('customers'));
    // const myLocalCustomer = localCustomerStoresFromLocalDb.find(c => c.customerUserId == customerUserId && c.customerId === storeId);

    const potentialCustomer = <LocalCustomerStore>await firstValueFrom(
      this.localDbService.getByIndex('customers', 'customerId', storeId)
    );

    // Verify this customer belongs to the current user
    if (!potentialCustomer || potentialCustomer.customerUserId !== customerUserId) {
      return null;
    }

    const myLocalCustomer = potentialCustomer;

    if (!myLocalCustomer) {
      return null;
    }

    return await this.buildCustomerStore(myLocalCustomer, customerUserId);
  }

  private async buildCustomerStore(lcs: LocalCustomerStore, customerUserId: number): Promise<CustomerStore> {
    const customerStore = new CustomerStore();
    customerStore.id = lcs.customerId;
    customerStore.name = lcs.name;
    customerStore.address = lcs.address;

    const paymentMethod = new PaymentMethod();
    paymentMethod.id = lcs.paymentMethodId;
    customerStore.paymentMethod = paymentMethod;

    const localCustomerAccount = await this.getLocalCustomerAccount(lcs.barangayId);
    const customerUser = await this.getCustomerUser(customerUserId);

    const barangay = new Barangay();
    barangay.id = localCustomerAccount.barangayId;
    barangay.name = localCustomerAccount.name;
    barangay.userAccountId = customerUser.userId;
    customerStore.barangay = barangay;

    return customerStore;
  }

  async manageLocalCustomerStore(customerStore: CustomerStore) {
    const customerUserId = await this.getCustomerUserId();

    const localCustomerStores = await this.getMyLocalCustomerStores([customerStore.id]);
    const newLocalCustomerStore = new LocalCustomerStore();

    if (localCustomerStores.length > 0) {
      const localCustomerAccount = localCustomerStores[0];
      newLocalCustomerStore.customerUserId = customerUserId;
      newLocalCustomerStore.id = localCustomerAccount.id;
      newLocalCustomerStore.customerId = customerStore.id;
      newLocalCustomerStore.name = customerStore.name;
      newLocalCustomerStore.emailAddress = customerStore.emailAddress;
      newLocalCustomerStore.outletType = getOutletTypeEnum(customerStore.outletType);
      newLocalCustomerStore.paymentMethodId = customerStore.paymentMethodId;
      newLocalCustomerStore.barangayId = customerStore.barangayId;
      await firstValueFrom(this.localDbService.update('customers', newLocalCustomerStore));
    } else {
      newLocalCustomerStore.customerUserId = customerUserId;
      newLocalCustomerStore.customerId = customerStore.id;
      newLocalCustomerStore.name = customerStore.name;
      newLocalCustomerStore.emailAddress = customerStore.emailAddress;
      newLocalCustomerStore.outletType = getOutletTypeEnum(customerStore.outletType);
      newLocalCustomerStore.paymentMethodId = customerStore.paymentMethodId;
      newLocalCustomerStore.barangayId = customerStore.barangayId;
      await firstValueFrom(this.localDbService.add('customers', newLocalCustomerStore));
    }
  }

  async deleteLocalCustomerStore(customerStoreId: number) {
    const localCustomerStores = await this.getMyLocalCustomerStores([customerStoreId]);

    if (localCustomerStores.length > 0) {
      const localCustomerStore = localCustomerStores[0];
      await firstValueFrom(this.localDbService.delete('customers', localCustomerStore.id));
    }
  }

  async clear() {
    await firstValueFrom(this.localDbService.clear('customers'));
  }

  private async getLocalCustomerAccount(customerAccountId: number): Promise<LocalCustomerStore> {
    const customerAccount = <LocalCustomerStore>await firstValueFrom(this.localDbService.getByIndex('customerAccounts', 'barangayId', customerAccountId));

    if (!customerAccount) {
      return new LocalCustomerStore();
    }

    return customerAccount;
  }

}
