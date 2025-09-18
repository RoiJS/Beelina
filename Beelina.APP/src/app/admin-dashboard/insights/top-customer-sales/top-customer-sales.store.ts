import { patchState, signalStore, withMethods, withState, withComputed, withHooks } from "@ngrx/signals";
import { inject, effect } from "@angular/core";
import { computed } from "@angular/core";

import { TransactionService, CustomerSale } from "src/app/_services/transaction.service";
import { SortOrderOptionsEnum } from "src/app/_enum/sort-order-options.enum";
import { IBaseState } from "src/app/_interfaces/states/ibase.state";
import { IBaseStateConnection } from "src/app/_interfaces/states/ibase-connection.state";

export interface ICustomerSalesState extends IBaseState, IBaseStateConnection {
  topCustomerSales: Array<CustomerSale>;
  storeId: number;
  fromDate: string,
  toDate: string,
  sortOrder: SortOrderOptionsEnum,
}

export const initialState: ICustomerSalesState = {
  isLoading: false,
  isUpdateLoading: false,
  topCustomerSales: new Array<CustomerSale>(),
  endCursor: null,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
  storeId: 0,
  fromDate: null,
  toDate: null,
  sortOrder: SortOrderOptionsEnum.DESCENDING,
};

export const TopCustomerSalesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    // Computed signal that combines both dates for easy subscription
    filterProps: computed(() => ({
      fromDate: store.fromDate(),
      toDate: store.toDate(),
      sortOrder: store.sortOrder()
    })),
  })),
  withMethods((store, transactionService = inject(TransactionService)) => ({
    getTopCustomerSales: () => {
      patchState(store, { isLoading: true });

      transactionService.getTopStoresSales(store.storeId(), store.fromDate(), store.toDate(), store.endCursor(), store.sortOrder()).subscribe({
        next: (data) => {
          patchState(store, {
            topCustomerSales: store.topCustomerSales().concat(data.topCustomerSales),
            endCursor: data.endCursor,
            isLoading: false
          });
        },
        error: (error) => {
          patchState(store, { error: error.message, isLoading: false });
        },
      });
    },

    setSortAndfilterTopCustomerSalesDates: (sortOrder: SortOrderOptionsEnum, dateStart: string, dateEnd: string) => {
      patchState(store, {
        sortOrder: sortOrder,
        fromDate: dateStart,
        toDate: dateEnd,
      });
    },

    setStoreId: (storeId: number) => {
      patchState(store, { storeId });
    },

    setSearchCustomerSales: (keyword: string) => {
      patchState(store, { filterKeyword: keyword });
    },

    reset: () => {
      patchState(store, { ...initialState })
    },

    resetList: () => {
      patchState(store, {
        topCustomerSales: initialState.topCustomerSales,
        endCursor: initialState.endCursor,
      });
    }
  }))
);
