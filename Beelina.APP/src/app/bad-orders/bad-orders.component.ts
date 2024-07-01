import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';

import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import { IFilterAndSortTransactions } from '../_interfaces/services/ifilter-and-sort-transactions.interface';
import { TransactionDatesDataSource } from '../_models/datasources/transaction-dates.datasource';

import { TransactionStatusEnum } from '../_enum/transaction-status.enum';

import * as TransactionDateActions from '../transaction-history/store/actions';
import { isLoadingSelector } from '../transaction-history/store/selectors';

import { BaseFilterAndSortService } from '../_services/base-filter-and-sort.service';
import { DialogService } from '../shared/ui/dialog/dialog.service';
import { MultipleItemsService } from '../_services/multiple-items.service';
import { NotificationService } from '../shared/ui/notification/notification.service';
import { TransactionByDateOptionsService } from '../_services/transaction-by-date-options.service';
import { TransactionDateInformation, TransactionService } from '../_services/transaction.service';

import { BaseComponent } from '../shared/components/base-component/base.component';
import { ButtonOptions } from '../_enum/button-options.enum';

@Component({
  selector: 'app-bad-orders',
  templateUrl: './bad-orders.component.html',
  styleUrls: ['./bad-orders.component.scss'],
})
export class BadOrdersComponent
  extends BaseComponent
  implements OnInit, IFilterAndSortTransactions {

  bottomSheet = inject(MatBottomSheet);
  dialogService = inject(DialogService);
  filterAndSortTransactionsService = inject(BaseFilterAndSortService<TransactionDateInformation>);
  multipleItemsService = inject(MultipleItemsService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  store = inject(Store<AppStateInterface>);
  translateService = inject(TranslateService);
  transactionService = inject(TransactionService);
  transactionByDateOptionsService = inject(TransactionByDateOptionsService);

  constructor() {
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

    this.transactionByDateOptionsService
      .setBottomSheet(this.bottomSheet);

    this.$isLoading = this.store.pipe(select(isLoadingSelector));
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.store.dispatch(
      TransactionDateActions.resetTransactionDatesState()
    );
    this.filterAndSortTransactionsService.destroy();
    this.multipleItemsService.reset();
  }

  goToTransactionDate(transactionDate: Date) {
    if (this.multipleItemsService.selectMultipleActive()) return;
    const date = DateFormatter.format(transactionDate);
    this.router.navigate([`bad-orders/transactions/${date}`]);
  }

  openFilter() {
    this.filterAndSortTransactionsService.openFilter();
  }

  openMoreActions(transationDateInformation: TransactionDateInformation) {
    this.transactionByDateOptionsService.openMenu(transationDateInformation, TransactionStatusEnum.BAD_ORDER);
  }

  deleteSelectedItems() {
    this.dialogService.openConfirmation(
      this.translateService.instant(
        'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_BY_DATE_DIALOG.TITLE'
      ),
      this.translateService.instant(
        'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_BY_DATE_DIALOG.CONFIRM'
      )
    ).subscribe((result: ButtonOptions) => {
      if (result === ButtonOptions.YES) {
        const orderDates = this.multipleItemsService.selectedItems().map((item) => DateFormatter.format(new Date(item)));
        this.store.dispatch(TransactionDateActions.setTransactionDatesLoadingState({ state: true }));
        this.transactionService
          .deleteTransactionsByDate(
            TransactionStatusEnum.BAD_ORDER,
            orderDates)
          .subscribe({
            next: () => {
              this.store.dispatch(TransactionDateActions.setTransactionDatesLoadingState({ state: false }));
              this.notificationService.openSuccessNotification(this.translateService.instant(
                'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_BY_DATE_DIALOG.SUCCESS_MESSAGE'
              ));
              this.store.dispatch(TransactionDateActions.resetTransactionDatesState());
              this.store.dispatch(TransactionDateActions.getTransactionDatesAction({ transactionStatus: TransactionStatusEnum.BAD_ORDER }));
              this.multipleItemsService.reset();
            },

            error: () => {
              this.notificationService.openErrorNotification(this.translateService.instant(
                'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_BY_DATE_DIALOG.ERROR_MESSAGE'
              ));
              this.multipleItemsService.reset();
            },
          });
      }
    })
  }

  selectAllItems(checked: boolean) {
    const items = this.dataSource.data.map((item) => item.transactionDate.toString());
    this.multipleItemsService.selectAllItems(checked, items);
  }

  selectItem(checked: boolean, id: string) {
    this.multipleItemsService.selectItem(checked, id, this.dataSource.itemCount);
  }

  get dataSource(): TransactionDatesDataSource {
    return <TransactionDatesDataSource>this.filterAndSortTransactionsService.dataSource;
  }

  get isFilterActive(): boolean {
    return this.filterAndSortTransactionsService.isFilterActive;
  }
}
