import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';

import { OrderTransactionDataSource } from 'src/app/_models/datasources/order-transactions.datasource';
import { TransactionsFilter } from 'src/app/_models/filters/transactions.filter';
import { Transaction } from 'src/app/_models/transaction';
import { OrderTransactionStore } from 'src/app/order-transactions/order-transactions.store';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

@Component({
  selector: 'app-store-transaction-history',
  templateUrl: './store-transaction-history.component.html',
  styleUrls: ['./store-transaction-history.component.scss'],
})
export class StoreTransactionHistoryComponent extends BaseComponent {
  private _storeId: number;

  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  orderTransactionStore = inject(OrderTransactionStore);
  transactionsFilter = signal<TransactionsFilter>(new TransactionsFilter());

  dataSource: OrderTransactionDataSource;

  constructor() {
    super();

    this.orderTransactionStore.reset();
    this._storeId = +this.activatedRoute.snapshot.paramMap.get('storeId');
    this.transactionsFilter.update(() => {
      const newTransactionsFilter = new TransactionsFilter();
      newTransactionsFilter.status = TransactionStatusEnum.CONFIRMED;
      newTransactionsFilter.paymentStatus = this.orderTransactionStore.paymentStatus();
      newTransactionsFilter.storeId = this._storeId;
      return newTransactionsFilter;
    });
    this.orderTransactionStore.setTransactionFilter(this.transactionsFilter());
    this.dataSource = new OrderTransactionDataSource();
  }

  goToTransaction(transaction: Transaction) {
    this.router.navigate([
      `/app/transaction-history/transactions/${DateFormatter.format(transaction.transactionDate, 'YYYY-MM-DD')}/${transaction.id}`
    ]);
  }
}
