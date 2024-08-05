
import { effect, inject } from '@angular/core';

import { BaseDataSource } from './base.datasource';
import { Transaction } from '../transaction';
import { OrderTransactionStore } from 'src/app/order-transactions/order-transactions.store';
import { MultipleEntitiesService } from 'src/app/_services/multiple-entities.service';

export class OrderTransactionDataSource extends BaseDataSource<Transaction> {
  transactionsStore = inject(OrderTransactionStore);
  multipleItemsService = inject(MultipleEntitiesService<Transaction>);

  constructor() {
    super();
    this.transactionsStore.getOrderTransactions();
    effect(() => {
      this._dataStream.next(this.transactionsStore.transactions());
      this.multipleItemsService.init(this.transactionsStore.transactions());
    }, {
      allowSignalWrites: true
    });
  }

  override fetchData() {
    this.transactionsStore.getOrderTransactions();
  }
}
