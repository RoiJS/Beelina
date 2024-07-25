import { Component, OnDestroy, OnInit, effect, inject, signal, viewChild } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ButtonOptions } from '../_enum/button-options.enum';
import { TransactionStatusEnum } from '../_enum/transaction-status.enum';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { OrderTransactionDataSource } from '../_models/datasources/order-transactions.datasource';
import { TransactionsFilter } from '../_models/filters/transactions.filter';
import { Transaction } from '../_models/transaction';
import { StorageService } from '../_services/storage.service';
import { TransactionService } from '../_services/transaction.service';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { DialogService } from '../shared/ui/dialog/dialog.service';
import { MultipleEntitiesService } from '../_services/multiple-entities.service';
import { NotificationService } from '../shared/ui/notification/notification.service';
import { SearchFieldComponent } from '../shared/ui/search-field/search-field.component';
import { OrderTransactionStore } from './order-transactions.store';
import { TransactionFilterComponent } from './transaction-filter/transaction-filter.component';
import { ViewSelectedOrdersComponent } from './view-selected-orders/view-selected-orders.component';

@Component({
  selector: 'app-order-transactions',
  templateUrl: './order-transactions.component.html',
  styleUrls: ['./order-transactions.component.scss']
})
export class OrderTransactionsComponent extends BaseComponent implements OnInit, OnDestroy {

  searchFieldComponent = viewChild(SearchFieldComponent);
  dataSource: OrderTransactionDataSource;

  bottomSheet = inject(MatBottomSheet);
  dialogService = inject(DialogService);
  notificationService = inject(NotificationService);
  orderTransactionStore = inject(OrderTransactionStore);
  router = inject(Router);
  storageService = inject(StorageService);
  transactionService = inject(TransactionService);
  translateService = inject(TranslateService);

  transactionsFilter = signal<TransactionsFilter>(new TransactionsFilter());
  multipleItemsService = inject(MultipleEntitiesService<Transaction>);

  validRoute = false;

  _dialogOpenFilterRef: MatBottomSheetRef<
    TransactionFilterComponent,
    {
      transactionStatus: TransactionStatusEnum;
      transactionDate: Date;
    }
  >;

  _dialogOpenViewSelectedOrdersRef: MatBottomSheetRef<ViewSelectedOrdersComponent>;

  constructor() {
    super();

    effect(() => {
      this.searchFieldComponent().value(this.orderTransactionStore.filterKeyword());
    });

    if (!this.orderTransactionStore.filterKeyword()) {
      this.transactionsFilter.update(() => {
        const newTransactionsFilter = new TransactionsFilter();
        newTransactionsFilter.transactionDate = DateFormatter.format(new Date());
        return newTransactionsFilter;
      });
      this.orderTransactionStore.setTransactionFilter(this.transactionsFilter());
    }

    this.dataSource = new OrderTransactionDataSource();
  }

  ngOnDestroy() {
    if (!this.validRoute) {
      this.multipleItemsService.reset();
    }
    this.orderTransactionStore.resetList();
    this._dialogOpenViewSelectedOrdersRef = null;
    this._dialogOpenFilterRef = null;
  }

  ngOnInit() {
  }

  onSearch(filterKeyword: string) {
    this.transactionsFilter().reset();
    this.orderTransactionStore.reset();
    this.orderTransactionStore.setSearchSuppliers(filterKeyword);
    this.orderTransactionStore.getOrderTransactions();
  }

  onClear() {
    this.onSearch('');
  }

  openFilter() {
    this._dialogOpenFilterRef = this.bottomSheet.open(TransactionFilterComponent, {
      data: this.transactionsFilter()
    });

    this._dialogOpenFilterRef
      .afterDismissed()
      .subscribe(
        (data: {
          transactionStatus: TransactionStatusEnum;
          transactionDate: Date;
        }) => {
          if (!data) return;

          this.transactionsFilter.update(() => {
            const newTransactionsFilter = new TransactionsFilter();
            newTransactionsFilter.transactionDate = DateFormatter.format(new Date());
            newTransactionsFilter.transactionDate = DateFormatter.format(data.transactionDate);
            return newTransactionsFilter;
          });

          this.orderTransactionStore.resetList();
          this.orderTransactionStore.setTransactionFilter(this.transactionsFilter());
          this.orderTransactionStore.getOrderTransactions();
        });
  }

  selectAllItems(checked: boolean) {
    const items = this.orderTransactionStore.transactions();
    this.multipleItemsService.selectAllItems(checked, items);
  }

  selectItem(checked: boolean, id: string) {
    const transaction = this.orderTransactionStore.transactions().find((item) => item.id.toString() === id);
    this.multipleItemsService.selectItem(checked, transaction, this.orderTransactionStore.transactions());
  }

  viewSelectedOrders() {
    this._dialogOpenViewSelectedOrdersRef = this.bottomSheet.open(ViewSelectedOrdersComponent, {
      data: {
        transactions: this.orderTransactionStore.transactions()
      }
    });

    this._dialogOpenViewSelectedOrdersRef
      .afterDismissed()
      .subscribe((data: {
        selectedItems: Transaction[]
      }) => {
        if (!data) return;

        this.multipleItemsService.selectedItems.update(() => [...data.selectedItems]);
      });
  }

  markOrdersAsPaid() {

    if (this.hasNonConfirmedOrders()) {
      this.notificationService.openWarningNotification(this.translateService.instant('ORDER_TRANSACTIONS_PAGE.MARK_ORDER_AS_PAID_DIALOG.WARNING_MESSAGE'));
      return;
    }

    this.dialogService
      .openConfirmation(
        this.translateService.instant('ORDER_TRANSACTIONS_PAGE.MARK_ORDER_AS_PAID_DIALOG.TITLE'),
        this.translateService.instant('ORDER_TRANSACTIONS_PAGE.MARK_ORDER_AS_PAID_DIALOG.CONFIRM_MESSAGE'))
      .subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this.orderTransactionStore.setLoadingStatus(true);
          const selectedItems = this.multipleItemsService.selectedItems().map((i) => +i.id);

          this.transactionService.markTransactionsAsPaid(selectedItems, true).subscribe({
            next: () => {
              this.notificationService.openSuccessNotification(this.translateService.instant('ORDER_TRANSACTIONS_PAGE.MARK_ORDER_AS_PAID_DIALOG.SUCCESS_MESSAGE'));
              this.activateSelectMultiple(false, false);
              this.orderTransactionStore.setLoadingStatus(false);
            },
            error: () => {
              this.notificationService.openSuccessNotification(this.translateService.instant('ORDER_TRANSACTIONS_PAGE.MARK_ORDER_AS_PAID_DIALOG.ERROR_MESSAGE'));
              this.orderTransactionStore.setLoadingStatus(false);
            }
          });
        }
      });
  }

  activateSelectMultiple(status: boolean, userInteract: boolean = true) {

    const setStatus = (status: boolean) => {
      this.multipleItemsService.activateSelectMultiple(status);
    }

    if (userInteract) {
      if (!status) {
        if (this.multipleItemsService.selectedItems().length > 0) {
          this.dialogService
            .openConfirmation(
              this.translateService.instant('TRANSACTION_SELECT_MULTIPLE_MODE.DEACTIVATE_SELECT_MULTIPLE_DIALOG.TITLE'),
              this.translateService.instant('TRANSACTION_SELECT_MULTIPLE_MODE.DEACTIVATE_SELECT_MULTIPLE_DIALOG.CONFIRM_MESSAGE'))
            .subscribe((result: ButtonOptions) => {
              if (result === ButtonOptions.YES) {
                setStatus(status);
              }
            });
        } else {
          setStatus(status);
        }
      } else {
        setStatus(status);
      }

    } else {
      setStatus(status);
    }
  }

  viewTransaction(transaction: Transaction) {
    this.validRoute = true;
    this.storageService.storeString('currentSalesAgentId', transaction.createdById.toString());
    this.router.navigate([`product-catalogue/product-cart/${transaction.id}`], {
      state: {
        dateUpdated: transaction.finalDateUpdatedFormatted,
        updatedBy: transaction.detailsUpdatedBy
      }
    });
  }

  private hasNonConfirmedOrders(): boolean {
    const nonConfirmedOrders = this.multipleItemsService.selectedItems().filter(t =>
      t.status !== TransactionStatusEnum.CONFIRMED
    );
    return nonConfirmedOrders.length > 0;
  }
}
