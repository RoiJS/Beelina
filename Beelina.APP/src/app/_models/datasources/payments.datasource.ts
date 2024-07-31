import { effect, inject } from '@angular/core';

import { BaseDataSource } from './base.datasource';
import { Payment } from '../payment';
import { PaymentStore } from 'src/app/transaction-history/transactions/transaction-details/payments/payments.store';

export class PaymentsDataSource extends BaseDataSource<Payment> {
  paymentsStore = inject(PaymentStore);
  constructor(protected transactionId: number) {
    super();
    this.paymentsStore.getPayments(this.transactionId);
    effect(() => {
      this._dataStream.next(this.paymentsStore.payments());
    }, {
      allowSignalWrites: true
    });
  }

  override fetchData() {
    this.paymentsStore.getPayments(this.transactionId);
  }
}
