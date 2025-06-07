import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";

import { IBaseStateConnection } from "../_interfaces/states/ibase-connection.state";
import { IBaseState } from "../_interfaces/states/ibase.state";
import { Transaction } from "../_models/transaction";
import { TransactionService } from "../_services/transaction.service";
import { TransactionsFilter } from "../_models/filters/transactions.filter";

import { PaymentStatusEnum } from "../_enum/payment-status.enum";
import { TransactionStatusEnum } from "../_enum/transaction-status.enum";

export interface IOrderTransactionState extends IBaseState, IBaseStateConnection {
  transactions: Array<Transaction>;
  totalCount: number;
  transactionStatus: TransactionStatusEnum;
  transactionDate: string;
  paymentStatus: PaymentStatusEnum
}

export const initialState: IOrderTransactionState = {
  isLoading: false,
  isUpdateLoading: false,
  transactions: new Array<Transaction>(),
  transactionStatus: TransactionStatusEnum.ALL,
  transactionDate: '',
  endCursor: null,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
  totalCount: 0,
  paymentStatus: PaymentStatusEnum.All
};

export const OrderTransactionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, transactionService = inject(TransactionService)) => ({
    getOrderTransactions: () => {
      patchState(store, { isLoading: true });

      const transactionsFilter = new TransactionsFilter();
      transactionsFilter.status = store.transactionStatus();
      transactionsFilter.transactionDate = store.transactionDate();

      if (store.filterKeyword() || transactionsFilter.isActive()) {
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
      } else {
        patchState(store, {
          transactions: initialState.transactions,
          endCursor: initialState.endCursor,
          isLoading: initialState.isLoading,
          totalCount: initialState.totalCount
        });
        return 0;
      }
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
        transactionDate: transactionFilter.transactionDate,
        paymentStatus: transactionFilter.paymentStatus
      });
    },

    reset: () => {
      patchState(store, { ...initialState })
    },

    resetList: () => {
      patchState(store, {
        transactions: initialState.transactions,
        endCursor: initialState.endCursor,
        transactionDate: store.transactionDate(),
        transactionStatus: store.transactionStatus(),
        paymentStatus: store.paymentStatus()
      });
    }
  }))
);
