import { Component, OnDestroy, effect, inject, signal, viewChild } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ButtonOptions } from '../_enum/button-options.enum';
import { SortOrderOptionsEnum } from '../_enum/sort-order-options.enum';
import { TransactionStatusEnum } from '../_enum/transaction-status.enum';
import { ViewModeEnum } from '../_enum/view-mode.enum';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { OrderTransactionDataSource } from '../_models/datasources/order-transactions.datasource';
import { OrderTransactionTableDataSource } from '../_models/datasources/order-transactions-table.datasource';
import { TransactionsFilter } from '../_models/filters/transactions.filter';
import { Transaction } from '../_models/transaction';
import { OrderTransactionStore } from './order-transactions.store';

import { SearchFieldComponent } from '../shared/ui/search-field/search-field.component';
import { SharedComponent } from '../shared/components/shared/shared.component';
import { TransactionFilterComponent } from './transaction-filter/transaction-filter.component';
import { ViewSelectedOrdersComponent } from './view-selected-orders/view-selected-orders.component';

import { DialogService } from '../shared/ui/dialog/dialog.service';
import { MultipleEntitiesService } from '../_services/multiple-entities.service';
import { NotificationService } from '../shared/ui/notification/notification.service';
import { StorageService } from '../_services/storage.service';
import { TransactionService } from '../_services/transaction.service';

import { PaymentStatusEnum } from '../_enum/payment-status.enum';
import { UIService } from '../_services/ui.service';

@Component({
  selector: 'app-order-transactions',
  templateUrl: './order-transactions.component.html',
  styleUrls: ['./order-transactions.component.scss']
})
export class OrderTransactionsComponent extends SharedComponent implements OnDestroy {

  searchFieldComponent = viewChild(SearchFieldComponent);
  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);

  // Data sources for different view modes
  dataSource: OrderTransactionDataSource;
  tableDataSource: OrderTransactionTableDataSource | null = null;

  // View mode management
  currentViewMode = signal<ViewModeEnum>(ViewModeEnum.TABLE);
  viewModeEnum = ViewModeEnum;

  // Pagination state for table view
  currentPageSize = signal<number>(10);
  currentPageIndex = signal<number>(0);

  // Table configuration
  displayedColumns: string[] = ['invoiceNo', 'createdBy', 'storeName', 'transactionDate', 'status', 'actions'];

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
      dateFrom: string;
      dateTo: string;
      paymentStatus: PaymentStatusEnum;
    }
  >;

  _dialogOpenViewSelectedOrdersRef: MatBottomSheetRef<ViewSelectedOrdersComponent>;

  constructor(protected override uiService: UIService) {
    super(uiService);

    this.transactionsFilter.update(() => {
      const newTransactionsFilter = new TransactionsFilter();
      newTransactionsFilter.status = this.orderTransactionStore.transactionStatus();

      if (this.orderTransactionStore.dateFrom().length === 0 && this.orderTransactionStore.dateTo().length === 0) {
        // For initial load, set both dateFrom and dateTo to today's date
        const today = DateFormatter.format(new Date());
        newTransactionsFilter.dateFrom = today;
        newTransactionsFilter.dateTo = today;
      } else {
        // Use existing date range from store
        newTransactionsFilter.dateFrom = this.orderTransactionStore.dateFrom();
        newTransactionsFilter.dateTo = this.orderTransactionStore.dateTo();
        newTransactionsFilter.paymentStatus = this.orderTransactionStore.paymentStatus();
      }

      return newTransactionsFilter;
    });

    this.orderTransactionStore.setTransactionFilter(this.transactionsFilter());

    this.dataSource = new OrderTransactionDataSource();
    this.tableDataSource = new OrderTransactionTableDataSource();

    effect(() => {
      this.searchFieldComponent().value(this.orderTransactionStore.filterKeyword());
    });

    // Effect to update table datasource when store data changes (for table view)
    effect(() => {
      if (this.currentViewMode() === ViewModeEnum.TABLE && this.tableDataSource) {
        const transactions = this.orderTransactionStore.transactions();
        this.tableDataSource.updateData(transactions);
      }
    }, {
      allowSignalWrites: true
    });
  }

  override ngOnDestroy() {
    if (!this.validRoute) {
      this.multipleItemsService.reset();
    }
    this.orderTransactionStore.resetList();
    this._dialogOpenViewSelectedOrdersRef = null;
    this._dialogOpenFilterRef = null;

    super.ngOnDestroy();
  }

  onSearch(filterKeyword: string) {
    this.orderTransactionStore.resetList();
    this.orderTransactionStore.setSearchSuppliers(filterKeyword);

    // Reset pagination when searching
    this.currentPageIndex.set(0);

    // Use appropriate method based on current view mode
    if (this.currentViewMode() === ViewModeEnum.TABLE) {
      const take = this.currentPageSize();
      const skip = this.currentPageIndex() * this.currentPageSize();
      this.orderTransactionStore.setPagination(skip, take);
      // Set current sort if available
      if (this.sort()) {
        this.orderTransactionStore.setSort(this.sort().active, <SortOrderOptionsEnum>this.sort().direction.toUpperCase());
      }
      this.orderTransactionStore.getOrderTransactionsForTable();
    } else {
      this.orderTransactionStore.getOrderTransactions();
    }
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
          dateFrom: string;
          dateTo: string;
          paymentStatus: PaymentStatusEnum;
        }) => {
          if (!data) return;

          this.transactionsFilter.update(() => {
            const newTransactionsFilter = new TransactionsFilter();
            newTransactionsFilter.dateFrom = data.dateFrom;
            newTransactionsFilter.dateTo = data.dateTo;
            newTransactionsFilter.status = data.transactionStatus;
            newTransactionsFilter.paymentStatus = data.paymentStatus;
            return newTransactionsFilter;
          });

          this.orderTransactionStore.resetList();
          this.orderTransactionStore.setTransactionFilter(this.transactionsFilter());

          // Reset pagination when filtering
          this.currentPageIndex.set(0);

          // Use appropriate method based on current view mode
          if (this.currentViewMode() === ViewModeEnum.TABLE) {
            const take = this.currentPageSize();
            const skip = this.currentPageIndex() * this.currentPageSize();
            this.orderTransactionStore.setPagination(skip, take);
            // Set current sort if available
            if (this.sort()) {
              this.orderTransactionStore.setSort(this.sort().active, <SortOrderOptionsEnum>this.sort().direction.toUpperCase());
            }
            this.orderTransactionStore.getOrderTransactionsForTable();
          } else {
            this.orderTransactionStore.getOrderTransactions();
          }
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
              this.notificationService.openErrorNotification(this.translateService.instant('ORDER_TRANSACTIONS_PAGE.MARK_ORDER_AS_PAID_DIALOG.ERROR_MESSAGE'));
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

  /**
   * Switch between list and table view modes
   */
  switchViewMode(viewMode: ViewModeEnum) {
    if (this.currentViewMode() === viewMode) {
      return;
    }

    this.currentViewMode.set(viewMode);

    if (viewMode === ViewModeEnum.TABLE) {
      // Initialize table data source if not already created
      if (!this.tableDataSource) {
        this.tableDataSource = new OrderTransactionTableDataSource();
      }

      // Reset pagination when switching to table view
      this.currentPageIndex.set(0);
      this.currentPageSize.set(10);

      // Set up initial sorting and pagination in store
      setTimeout(() => {
        if (this.sort()) {
          this.orderTransactionStore.setSort(this.sort().active || 'transactionDate',
            <SortOrderOptionsEnum>(this.sort().direction.toUpperCase() || 'DESC'));
          this.tableDataSource!.sort = this.sort();
        }

        // Load data for table view
        this.loadTableData();
      });
    }
  }

  /**
   * Load data for table view
   */
  private loadTableData() {
    // Set pagination and then load data
    const take = this.currentPageSize();
    const skip = this.currentPageIndex() * this.currentPageSize();
    this.orderTransactionStore.setPagination(skip, take);
    this.orderTransactionStore.getOrderTransactionsForTable();
  }

  /**
   * Select all items in table view
   */
  selectAllTableItems(checked: boolean) {
    const items = this.tableDataSource?.data || [];
    this.multipleItemsService.selectAllItems(checked, items);
  }

  /**
   * Select individual item in table view
   */
  selectTableItem(checked: boolean, transaction: Transaction) {
    const items = this.tableDataSource?.data || [];
    this.multipleItemsService.selectItem(checked, transaction, items);
  }

  /**
   * Handle pagination events from MatPaginator
   */
  onPageChange(event: PageEvent) {
    this.currentPageSize.set(event.pageSize);
    this.currentPageIndex.set(event.pageIndex);

    // Reload data with new pagination parameters
    if (this.currentViewMode() === ViewModeEnum.TABLE) {
      const take = this.currentPageSize();
      const skip = this.currentPageIndex() * this.currentPageSize();
      this.orderTransactionStore.setPagination(skip, take);
      this.orderTransactionStore.getOrderTransactionsForTable();
    }
  }

  /**
   * Handle sorting events from MatSort
   */
  onSortChange(event: Sort) {
    if (this.currentViewMode() === ViewModeEnum.TABLE) {
      this.orderTransactionStore.setSort(event.active, <SortOrderOptionsEnum>event.direction.toUpperCase());
      this.orderTransactionStore.getOrderTransactionsForTable();
    }
  }  /**
   * Get displayed columns based on current selection mode and screen size
   */
  getDisplayedColumns(): string[] {
    let baseColumns: string[];

    // Define columns based on screen size
    if (this._isMobile) {
      // Mobile: Show only essential columns
      baseColumns = ['invoiceNo', 'status', 'actions'];
    } else if (this._isTablet) {
      // Tablet: Hide less important columns
      baseColumns = ['invoiceNo', 'transactionDate', 'status', 'actions'];
    } else {
      // Desktop: Show all columns
      baseColumns = this.displayedColumns;
    }

    // Add select column if multiple selection is active
    if (this.multipleItemsService.selectMultipleActive()) {
      return ['select', ...baseColumns];
    }
    return baseColumns;
  }
}
