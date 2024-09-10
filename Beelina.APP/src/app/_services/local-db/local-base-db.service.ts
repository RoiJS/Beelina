import { Injectable, inject, signal } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom, Observable } from 'rxjs';

import { StorageService } from '../storage.service';
import { AuthService } from '../auth.service';
import { LocalCustomerUser } from 'src/app/_models/local-db/local-customer-user.model';

@Injectable({
  providedIn: 'root'
})
export class LocalBaseDbService {

  protected authService = inject(AuthService);
  protected localStorageService = inject(StorageService);
  public localDbService = inject(NgxIndexedDBService);

  async getCustomerUser(): Promise<number> {
    const userId = this.authService.user.value.id;
    const company = this.localStorageService.getString('company');

    const customerUsersFromLocalDb = await firstValueFrom(this.localDbService.getAll('customerUsers'));
    const customerUsers = <Array<LocalCustomerUser>>customerUsersFromLocalDb
      .filter((c: LocalCustomerUser) => c.userId == userId && c.customer == company);

    if (customerUsers.length > 0) {
      return customerUsers[0].id;
    } else {
      const newLocalCustomerUser = new LocalCustomerUser();
      newLocalCustomerUser.customer = company;
      newLocalCustomerUser.userId = userId;
      newLocalCustomerUser.lastDateUpdated = new Date();

      const newCustomerUser = await firstValueFrom(this.localDbService.add('customerUsers', newLocalCustomerUser));
      return newCustomerUser.id;
    }
  }
}
