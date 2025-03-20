import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";

import { IBaseStateConnection } from "../_interfaces/states/ibase-connection.state";
import { IBaseState } from "../_interfaces/states/ibase.state";
import { ProductWarehouseStockReceiptEntry } from "../_models/product-warehouse-stock-receipt-entry";
import { ProductService } from "../_services/product.service";
import { SortOrderOptionsEnum } from "../_enum/sort-order-options.enum";

export interface IProductWarehouseStockReceiptEntryState extends IBaseState, IBaseStateConnection {
  productWarehouseStockReceiptEntries: Array<ProductWarehouseStockReceiptEntry>;
  supplierId: number;
  dateFrom: string;
  dateTo: string;
  totalCount: number;
  sortField: string;
  sortDirection: SortOrderOptionsEnum;
}

export const initialState: IProductWarehouseStockReceiptEntryState = {
  isLoading: false,
  isUpdateLoading: false,
  productWarehouseStockReceiptEntries: new Array<ProductWarehouseStockReceiptEntry>(),
  skip: 0,
  take: 50,
  supplierId: 0,
  filterKeyword: '',
  dateFrom: '',
  dateTo: '',
  hasNextPage: false,
  error: null,
  totalCount: 0,
  sortDirection: SortOrderOptionsEnum.DESCENDING,
  sortField: ""
};

export const ProductWarehouseStockReceiptEntriesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, productService = inject(ProductService)) => ({
    getProductWarehouseStockReceiptEntries: () => {
      patchState(store, { isLoading: true });
      return productService.getProductWarehouseStockReceiptEntries(
        store.filterKeyword(),
        store.supplierId(),
        store.dateFrom(),
        store.dateTo(),
        store.skip(),
        store.take(),
        store.sortField(),
        store.sortDirection(),
      ).subscribe({
        next: (data) => {
          patchState(store, {
            productWarehouseStockReceiptEntries: data.productWarehouseStockReceiptEntries,
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

    reset: () => {
      patchState(store, { ...initialState })
    },

    resetList: () => {
      patchState(store, { productWarehouseStockReceiptEntries: initialState.productWarehouseStockReceiptEntries, endCursor: initialState.endCursor });
    }
  }))
);
