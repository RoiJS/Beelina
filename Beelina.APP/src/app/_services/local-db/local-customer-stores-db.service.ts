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

    const customerUserId = await this.getCustomerUser();
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
    console.log('newCustomers: ', newCustomers);
  }

  async getMyLocalCustomerStores(storeIds: Array<number> = null): Promise<Array<CustomerStore>> {
    const customerUserId = await this.getCustomerUser();
    const localCustomerStoresFromLocalDb = <Array<LocalCustomerStore>>await firstValueFrom(this.localDbService.getAll('customers'));
    let myLocalCustomers = localCustomerStoresFromLocalDb.filter(c => c.customerUserId == customerUserId);

    if (storeIds !== null) {
      myLocalCustomers = myLocalCustomers.filter(c => storeIds.includes(c.customerId));
    }

    const customerStores = await Promise.all(myLocalCustomers.map(async (lcs: LocalCustomerStore) => {
      const customerStore = new CustomerStore();
      customerStore.id = lcs.customerId;
      customerStore.name = lcs.name;
      customerStore.address = lcs.address;

      const paymentMethod = new PaymentMethod();
      paymentMethod.id = lcs.paymentMethodId;
      customerStore.paymentMethod = paymentMethod;

      const localCustomerAccount = await this.getLocalCustomerAccount(lcs.barangayId);
      const barangay = new Barangay();

      barangay.id = localCustomerAccount.barangayId;
      barangay.name = localCustomerAccount.name;
      customerStore.barangay = barangay;

      return customerStore;
    }));

    return customerStores;
  }

  async manageLocalCustomerStore(customerStore: CustomerStore) {
    const customerUserId = await this.getCustomerUser();

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
