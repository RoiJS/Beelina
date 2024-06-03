
import { effect, inject } from '@angular/core';

import { BaseDataSource } from './base.datasource';
import { Transaction } from '../transaction';
import { OrderTransactionStore } from 'src/app/order-transactions/order-transactions.store';

export class OrderTransactionDataSource extends BaseDataSource<Transaction> {
  transactionsStore = inject(OrderTransactionStore);
  constructor() {
    super();
    this.transactionsStore.getOrderTransactions();
    effect(() => {
      this._dataStream.next(this.transactionsStore.transactions());
    }, {
      allowSignalWrites: true
    });
  }

  override fetchData() {
    this.transactionsStore.getOrderTransactions();
  }
}
