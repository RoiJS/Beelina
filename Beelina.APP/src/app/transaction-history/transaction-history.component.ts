import { Component, OnDestroy } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';

import * as TransactionDateStoreActions from '../transaction-history/store/actions';

import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { BaseComponent } from '../shared/components/base-component/base.component';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import { TransactionDatesDataSource } from '../_models/datasources/transaction-dates.datasource';

import { isLoadingSelector } from '../transaction-history/store/selectors';

import { TransactionStatusEnum } from '../_enum/transaction-status.enum';
import { IFilterAndSortTransactions } from '../_interfaces/services/ifilter-and-sort-transactions.interface';
import { FilterAndSortTransactionsService } from '../_services/filter-and-sort-transactions.service';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss'],
})
export class TransactionHistoryComponent
  extends BaseComponent
  implements OnDestroy, IFilterAndSortTransactions
{
  /**
   * Constructor for the class.
   *
   * @param {Router} router - The router object.
   * @param {Store<AppStateInterface>} store - The store object.
   */
  constructor(
    private router: Router,
    private store: Store<AppStateInterface>,
    private bottomSheet: MatBottomSheet,
    private filterAndSortTransactionsService: FilterAndSortTransactionsService
  ) {
    super();

    // Assign the result of store.pipe(select(isLoadingSelector)) to this.$isLoading.
    this.$isLoading = this.store.pipe(select(isLoadingSelector));

    this.filterAndSortTransactionsService
      .setBottomSheet(this.bottomSheet)
      .setProps(
        'dateStart_transactionHistoryPage',
        'dateEnd_transactionHistoryPage',
        'sortOrder_transactionHistoryPage'
      )
      .setDataSource(
        new TransactionDatesDataSource(
          this.store,
          TransactionStatusEnum.CONFIRMED
        )
      );
  }

  ngOnDestroy() {
    this.store.dispatch(
      TransactionDateStoreActions.resetTransactionDatesState()
    );
    this.filterAndSortTransactionsService.destroy();
  }

  /**
   * Navigates to the transaction history page for the specified transaction date.
   * @param transactionDate - The date of the transaction.
   */
  goToTransactionDate(transactionDate: Date) {
    // Format the transaction date as a string
    const formattedDate = DateFormatter.format(transactionDate);

    // Construct the URL for the transaction history page
    const url = `transaction-history/transactions/${formattedDate}`;

    // Navigate to the transaction history page
    this.router.navigate([url]);
  }

  openFilter() {
    this.filterAndSortTransactionsService.openFilter();
  }

  get dataSource(): TransactionDatesDataSource {
    return this.filterAndSortTransactionsService.dataSource;
  }

  get isFilterActive(): boolean {
    return this.filterAndSortTransactionsService.isFilterActive;
  }
}
