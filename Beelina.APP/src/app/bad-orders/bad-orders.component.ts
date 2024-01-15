import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';

import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import { IFilterAndSortTransactions } from '../_interfaces/services/ifilter-and-sort-transactions.interface';
import { TransactionDatesDataSource } from '../_models/datasources/transaction-dates.datasource';

import { TransactionStatusEnum } from '../_enum/transaction-status.enum';

import * as TransactionDateStoreActions from '../transaction-history/store/actions';
import { isLoadingSelector } from '../transaction-history/store/selectors';

import { BaseFilterAndSortService } from '../_services/base-filter-and-sort.service';

import { BaseComponent } from '../shared/components/base-component/base.component';
import { TransactionDateInformation } from '../_services/transaction.service';

@Component({
  selector: 'app-bad-orders',
  templateUrl: './bad-orders.component.html',
  styleUrls: ['./bad-orders.component.scss'],
})
export class BadOrdersComponent
  extends BaseComponent
  implements OnInit, IFilterAndSortTransactions {
  constructor(
    private router: Router,
    private store: Store<AppStateInterface>,
    private bottomSheet: MatBottomSheet,
    private filterAndSortTransactionsService: BaseFilterAndSortService<TransactionDateInformation>
  ) {
    super();

    this.filterAndSortTransactionsService
      .setBottomSheet(this.bottomSheet)
      .setProps(
        'dateStart_badOrdersPage',
        'dateEnd_badOrdersPage',
        'sortOrder_badOrdersPage'
      )
      .setDataSource(
        new TransactionDatesDataSource(this.store, TransactionStatusEnum.BAD_ORDER)
      );

    this.$isLoading = this.store.pipe(select(isLoadingSelector));
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.store.dispatch(
      TransactionDateStoreActions.resetTransactionDatesState()
    );
    this.filterAndSortTransactionsService.destroy();
  }

  goToTransactionDate(transactionDate: Date) {
    const date = DateFormatter.format(transactionDate);
    this.router.navigate([`bad-orders/transactions/${date}`]);
  }

  openFilter() {
    this.filterAndSortTransactionsService.openFilter();
  }

  get dataSource(): TransactionDatesDataSource {
    return <TransactionDatesDataSource>this.filterAndSortTransactionsService.dataSource;
  }

  get isFilterActive(): boolean {
    return this.filterAndSortTransactionsService.isFilterActive;
  }
}
