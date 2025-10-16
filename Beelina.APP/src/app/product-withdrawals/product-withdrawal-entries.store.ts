import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";

import { IBaseStateConnection } from "../_interfaces/states/ibase-connection.state";
import { IBaseState } from "../_interfaces/states/ibase.state";
import { ProductService } from "../_services/product.service";
import { SortOrderOptionsEnum } from "../_enum/sort-order-options.enum";
import { ProductWithdrawalEntry } from "../_models/product-withdrawal-entry";

export interface IProductWithdrawalEntryState extends IBaseState, IBaseStateConnection {
  productWithdrawalEntries: Array<ProductWithdrawalEntry>;
  userAccountId: number;
  salesAgentId: number;
  dateFrom: string;
  dateTo: string;
  totalCount: number;
  sortField: string;
  sortDirection: SortOrderOptionsEnum;
}

export const initialState: IProductWithdrawalEntryState = {
  isLoading: false,
  isUpdateLoading: false,
  productWithdrawalEntries: new Array<ProductWithdrawalEntry>(),
  skip: 0,
  take: 50,
  userAccountId: 0,
  salesAgentId: 0,
  filterKeyword: '',
  dateFrom: '',
  dateTo: '',
  hasNextPage: false,
  error: null,
  totalCount: 0,
  sortDirection: SortOrderOptionsEnum.DESCENDING,
  sortField: ""
};

export const ProductWithdrawalEntriesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, productService = inject(ProductService)) => ({
    getProductWithdrawalEntries: () => {
      patchState(store, { isLoading: true });
      return productService.getProductWithdrawalEntries(
        store.filterKeyword(),
        store.userAccountId(),
        store.salesAgentId(),
        store.dateFrom(),
        store.dateTo(),
        store.skip(),
        store.take(),
        store.sortField(),
        store.sortDirection(),
      ).subscribe({
        next: (data) => {
          patchState(store, {
            productWithdrawalEntries: data.productWithdrawalsEntries,
            totalCount: data.totalCount,
            endCursor: data.endCursor,
            isLoading: false
          });
        },
        error: (error) => {
          patchState(store, { error: error.message, isLoading: false });
        },
      });
    },

    setPagination: (skip: number, take: number) => {
      patchState(store, { skip: skip, take: take });
    },

    setSort: (sortField: string, sortDirection: SortOrderOptionsEnum) => {
      patchState(store, { sortField: sortField, sortDirection: sortDirection });
    },

    setSearchFilterKeyword: (keyword: string,) => {
      patchState(store, { filterKeyword: keyword });
    },

    setDateFilters: (dateFrom: string, dateTo: string) => {
      patchState(store, { dateFrom: dateFrom, dateTo: dateTo });
    },

    setSalesAgentFilter: (salesAgentId: number) => {
      patchState(store, { salesAgentId: salesAgentId });
    },

    reset: () => {
      patchState(store, { ...initialState })
    },

    resetList: () => {
      patchState(store, { productWithdrawalEntries: initialState.productWithdrawalEntries, endCursor: initialState.endCursor });
    }
  }))
);
