import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { BarangayService } from '../barangay.service';
import { LocalBaseDbService } from './local-base-db.service';

import { LocalCustomerAccount } from 'src/app/_models/local-db/local-customer-account.model';
import { Barangay } from 'src/app/_models/barangay';

@Injectable({
  providedIn: 'root'
})
export class LocalCustomerAccountsDbService extends LocalBaseDbService {

  private barangayService = inject(BarangayService);

  async getCustomerAccountsFromServer() {

    const customerAccountsCount = <number>await firstValueFrom(this.localDbService.count('customerAccounts'));

    if (customerAccountsCount > 0) return;

    const customerUserId = await this.getCustomerUser();
    const allCustomerAccounts = await firstValueFrom(this.barangayService.getAllBarangays());
    const localCustomerAccounts = allCustomerAccounts.map(c => {
      const localCustomerStore = new LocalCustomerAccount();
      localCustomerStore.customerUserId = customerUserId;
      localCustomerStore.barangayId = c.id;
      localCustomerStore.name = c.name;
      return localCustomerStore;
    });

    const newCustomerAccounts = await firstValueFrom(this.localDbService.bulkAdd('customerAccounts', localCustomerAccounts));
    console.info('newCustomerAccountsCount: ', newCustomerAccounts.length);
  }

  async getMyLocalCustomerAccounts(customerAccountIds: Array<number> = null) {
    const customerUserId = await this.getCustomerUser();
    const localCustomerAccountsFromLocalDb = <Array<LocalCustomerAccount>>await firstValueFrom(this.localDbService.getAll('customerAccounts'));
    let myLocalCustomerAccounts = localCustomerAccountsFromLocalDb.filter(c => c.customerUserId == customerUserId);

    if (customerAccountIds !== null) {
      myLocalCustomerAccounts = myLocalCustomerAccounts.filter(c => customerAccountIds.includes(c.barangayId));
    }

    const customerAccounts = myLocalCustomerAccounts.map(lca => {
      const barangay = new Barangay();
      barangay.id = lca.barangayId;
      barangay.name = lca.name;
      return barangay;
    });

    return customerAccounts;
  }

  async manageLocalCustomerAccount(customerAccount: Barangay) {
    const customerUserId = await this.getCustomerUser();

    const localCustomerAccounts = await this.getMyLocalCustomerAccounts([customerAccount.id]);
    const newLocalCustomerAccount = new LocalCustomerAccount();

    if (localCustomerAccounts.length > 0) {
      const localCustomerAccount = localCustomerAccounts[0];
      newLocalCustomerAccount.id = localCustomerAccount.id;
      newLocalCustomerAccount.customerUserId = customerUserId;
      newLocalCustomerAccount.barangayId = localCustomerAccount.id;
      newLocalCustomerAccount.name = customerAccount.name;
      await firstValueFrom(this.localDbService.update('customerAccounts', newLocalCustomerAccount));
    } else {
      newLocalCustomerAccount.customerUserId = customerUserId;
      newLocalCustomerAccount.barangayId = customerAccount.id;
      newLocalCustomerAccount.name = customerAccount.name;
      await firstValueFrom(this.localDbService.add('customerAccounts', newLocalCustomerAccount));
    }
  }

  async deleteLocalCustomreAccount(customerAccountId: number) {
    const localCustomerAccounts = await this.getMyLocalCustomerAccounts([customerAccountId]);

    if (localCustomerAccounts.length > 0) {
      const localCustomerAccount = localCustomerAccounts[0];
      await firstValueFrom(this.localDbService.delete('customerAccounts', localCustomerAccount.id));
    }
  }

  async clear() {
    await firstValueFrom(this.localDbService.clear('customerAccounts'));
  }

}
