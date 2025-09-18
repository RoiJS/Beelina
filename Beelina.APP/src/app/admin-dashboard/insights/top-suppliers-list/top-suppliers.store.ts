import { patchState, signalStore, withMethods, withState, withComputed, withHooks } from "@ngrx/signals";
import { inject, effect } from "@angular/core";
import { computed } from "@angular/core";

import { SupplierService } from "src/app/_services/supplier.service";
import { TopSupplierBySales } from "src/app/_models/top-supplier-by-sales";
import { SortOrderOptionsEnum } from "src/app/_enum/sort-order-options.enum";
import { IBaseState } from "src/app/_interfaces/states/ibase.state";
import { IBaseStateConnection } from "src/app/_interfaces/states/ibase-connection.state";

// import { IBaseStateConnection } from "../_interfaces/states/ibase-connection.state";
// import { IBaseState } from "../_interfaces/states/ibase.state";
// import { Supplier } from "../_models/supplier";
// import { SupplierService } from "../_services/supplier.service";
// import { SortOrderOptionsEnum } from "../_enum/sort-order-options.enum";

export interface ISupplierState extends IBaseState, IBaseStateConnection {
  topSuppliersBySales: Array<TopSupplierBySales>;
  fromDate: string,
  toDate: string,
  sortOrder: SortOrderOptionsEnum,
}

export const initialState: ISupplierState = {
  isLoading: false,
  isUpdateLoading: false,
  topSuppliersBySales: new Array<TopSupplierBySales>(),
  endCursor: null,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
  fromDate: null,
  toDate: null,
  sortOrder: SortOrderOptionsEnum.DESCENDING,
};

export const TopSupplierStore = signalStore(
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
  withMethods((store, supplierService = inject(SupplierService)) => ({
    getTopSuppliersBySales: () => {
      patchState(store, { isLoading: true });
      return supplierService.getTopSuppliersBySales(store.fromDate(), store.toDate(), store.endCursor(), store.sortOrder()).subscribe({
        next: (data) => {
          patchState(store, {
            topSuppliersBySales: store.topSuppliersBySales().concat(data.topSupplierBySales),
            endCursor: data.endCursor,
            isLoading: false
          });
        },
        error: (error) => {
          patchState(store, {
            error: error.message,
            isLoading: false
          });
        },
      });
    },

    setSortAndfilterTopSellingProductsDates: (sortOrder: SortOrderOptionsEnum, dateStart: string, dateEnd: string) => {
      patchState(store, {
        sortOrder: sortOrder,
        fromDate: dateStart,
        toDate: dateEnd,
      });
    },

    setSearchSuppliers: (keyword: string) => {
      patchState(store, { filterKeyword: keyword });
    },

    reset: () => {
      patchState(store, { ...initialState })
    },

    resetList: () => {
      patchState(store, {
        topSuppliersBySales: initialState.topSuppliersBySales,
        endCursor: initialState.endCursor,
      });
    }
  }))
);
