import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";

import { IBaseStateConnection } from "../_interfaces/states/ibase-connection.state";
import { IBaseState } from "../_interfaces/states/ibase.state";
import { Transaction } from "../_models/transaction";
import { TransactionService } from "../_services/transaction.service";
import { TransactionsFilter } from "../_models/filters/transactions.filter";

import { PaymentStatusEnum } from "../_enum/payment-status.enum";
import { SortOrderOptionsEnum } from "../_enum/sort-order-options.enum";
import { TransactionStatusEnum } from "../_enum/transaction-status.enum";

export interface IOrderTransactionState extends IBaseState, IBaseStateConnection {
  transactions: Array<Transaction>;
  totalCount: number;
  transactionStatus: TransactionStatusEnum;
  dateFrom: string;
  dateTo: string;
  paymentStatus: PaymentStatusEnum
  storeId: number;
  sortField: string;
  sortDirection: SortOrderOptionsEnum;
  skip: number;
  take: number;
}

export const initialState: IOrderTransactionState = {
  isLoading: false,
  isUpdateLoading: false,
  transactions: new Array<Transaction>(),
  transactionStatus: TransactionStatusEnum.ALL,
  dateFrom: '',
  dateTo: '',
  endCursor: null,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
  totalCount: 0,
  paymentStatus: PaymentStatusEnum.All,
  storeId: 0,
  sortField: 'transactionDate',
  sortDirection: SortOrderOptionsEnum.DESCENDING,
  skip: 0,
  take: 50
};

export const OrderTransactionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, transactionService = inject(TransactionService)) => ({
    getOrderTransactions: () => {
      patchState(store, { isLoading: true });

      const transactionsFilter = new TransactionsFilter();
      transactionsFilter.status = store.transactionStatus();
      transactionsFilter.paymentStatus = store.paymentStatus();
      transactionsFilter.dateFrom = store.dateFrom();
      transactionsFilter.dateTo = store.dateTo();
      transactionsFilter.storeId = store.storeId();

      return transactionService.getTransactions(store.endCursor(), store.filterKeyword(), transactionsFilter).subscribe({
        next: (data) => {
          patchState(store, {
            transactions: store.transactions().concat(data.transactions),
            endCursor: data.endCursor,
            isLoading: false,
            totalCount: data.totalCount
          });
        },
        error: (error) => {
          patchState(store, { isLoading: false, error: error.message });
        },
      });
    },

    setLoadingStatus: (isLoading: boolean) => {
      patchState(store, { isLoading });
    },

    setSearchSuppliers: (keyword: string) => {
      patchState(store, { filterKeyword: keyword });
    },

    setTransactionFilter: (transactionFilter: TransactionsFilter) => {
      patchState(store, {
        transactionStatus: transactionFilter.status,
        dateFrom: transactionFilter.dateFrom,
        dateTo: transactionFilter.dateTo,
        paymentStatus: transactionFilter.paymentStatus,
        storeId: transactionFilter.storeId
      });
    },

    reset: () => {
      patchState(store, { ...initialState })
    },

    resetList: () => {
      patchState(store, {
        transactions: initialState.transactions,
        endCursor: initialState.endCursor,
        dateFrom: store.dateFrom(),
        dateTo: store.dateTo(),
        transactionStatus: store.transactionStatus(),
        paymentStatus: store.paymentStatus()
      });
    },

    /**
     * Get transactions for table view using the new pagination strategy
     * This method supports server-side pagination with configurable skip, take, sortField, and sortDirection parameters
     */
    getOrderTransactionsForTable: () => {
      patchState(store, { isLoading: true });

      const transactionsFilter = new TransactionsFilter();
      transactionsFilter.status = store.transactionStatus();
      transactionsFilter.paymentStatus = store.paymentStatus();
      transactionsFilter.dateFrom = store.dateFrom();
      transactionsFilter.dateTo = store.dateTo();
      transactionsFilter.storeId = store.storeId();

      return transactionService.getTransactionsForTable(
        store.filterKeyword(),
        transactionsFilter,
        store.skip(),
        store.take(),
        store.sortField(),
        store.sortDirection()
      ).subscribe({
        next: (data) => {
          patchState(store, {
            transactions: data.transactions,
            isLoading: false,
            totalCount: data.totalCount
          });
        },
        error: (error) => {
          patchState(store, { isLoading: false, error: error.message });
        },
      });
    },

    setPagination: (skip: number, take: number) => {
      patchState(store, { skip: skip, take: take });
    },

    setSort: (sortField: string, sortDirection: SortOrderOptionsEnum) => {
      patchState(store, { sortField: sortField, sortDirection: sortDirection });
    },

    setSearchFilterKeyword: (keyword: string) => {
      patchState(store, { filterKeyword: keyword });
    }
  }))
);
