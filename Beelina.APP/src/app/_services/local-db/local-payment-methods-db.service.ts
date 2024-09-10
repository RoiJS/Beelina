import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { LocalBaseDbService } from './local-base-db.service';
import { PaymentMethodService } from '../payment-method.service';

import { LocalPaymentMethod } from 'src/app/_models/local-db/local-payment-method.model';
import { PaymentMethod } from 'src/app/_models/payment-method';

@Injectable({
  providedIn: 'root'
})
export class LocalPaymentMethodsDbService extends LocalBaseDbService {

  private paymentMethodsService = inject(PaymentMethodService);

  async getPaymentMethodsFromServer() {

    const paymentMethodsCount = <number>await firstValueFrom(this.localDbService.count('paymentMethods'));

    if (paymentMethodsCount > 0) return;

    const customerUserId = await this.getCustomerUser();
    const result = await firstValueFrom(this.paymentMethodsService.getPaymentMethods());
    const localPaymentMethods = result.paymentMethods.map(paymentMethod => {
      const localPaymentMethod = new LocalPaymentMethod();
      localPaymentMethod.customerUserId = customerUserId;
      localPaymentMethod.paymentMethodId = paymentMethod.id;
      localPaymentMethod.name = paymentMethod.name;
      return localPaymentMethod;
    });

    const newPaymentMethods = await firstValueFrom(this.localDbService.bulkAdd('paymentMethods', localPaymentMethods));
    console.log('newPaymentMethods:', newPaymentMethods);
  }

  async getMyLocalPaymentMethods() {
    let result: {
      endCursor: string;
      hasNextPage: boolean;
      paymentMethods: Array<PaymentMethod>;
      totalCount: number;
    } = {
      endCursor: null,
      hasNextPage: false,
      paymentMethods: [],
      totalCount: 0
    };

    const customerUserId = await this.getCustomerUser();
    const localPaymentMethodsFromLocalDb = <Array<LocalPaymentMethod>>await firstValueFrom(this.localDbService.getAll('paymentMethods'));
    const myLocalPaymentMethods = localPaymentMethodsFromLocalDb.filter(c => c.customerUserId == customerUserId);

    const paymentMethods = myLocalPaymentMethods.map(localPaymentMethod => {
      const paymentMethod = new PaymentMethod();
      paymentMethod.id = localPaymentMethod.paymentMethodId;
      paymentMethod.name = localPaymentMethod.name;
      return paymentMethod;
    });

    result.paymentMethods = paymentMethods;
    return result;
  }

  async clear() {
    await firstValueFrom(this.localDbService.clear('paymentMethods'));
  }

}
