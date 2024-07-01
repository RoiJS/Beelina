import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";

import { IBaseStateConnection } from "../_interfaces/states/ibase-connection.state";
import { IBaseState } from "../_interfaces/states/ibase.state";
import { Transaction } from "../_models/transaction";
import { TransactionService } from "../_services/transaction.service";

export interface IOrderTransactionState extends IBaseState, IBaseStateConnection {
  transactions: Array<Transaction>;
  totalCount: number;
}

export const initialState: IOrderTransactionState = {
  isLoading: false,
  isUpdateLoading: false,
  transactions: new Array<Transaction>(),
  endCursor: null,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
  totalCount: 0
};

export const OrderTransactionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, transactionService = inject(TransactionService)) => ({
    getOrderTransactions: () => {
      patchState(store, { isLoading: true });

      if (store.filterKeyword()) {
        return transactionService.getTransactions(store.endCursor(), store.filterKeyword()).subscribe({
          next: (data) => {
            patchState(store, {
              transactions: store.transactions().concat(data.transactions),
              endCursor: data.endCursor,
              isLoading: false,
              totalCount: data.totalCount
            });
          },
          error: (error) => {
            patchState(store, { error: error.message });
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

    setSearchSuppliers: (keyword: string) => {
      patchState(store, { filterKeyword: keyword });
    },

    reset: () => {
      patchState(store, { ...initialState })
    },

    resetList: () => {
      patchState(store, { transactions: initialState.transactions, endCursor: initialState.endCursor });
    }
  }))
);
