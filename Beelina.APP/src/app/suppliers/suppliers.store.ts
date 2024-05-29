import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";

import { IBaseStateConnection } from "../_interfaces/states/ibase-connection.state";
import { IBaseState } from "../_interfaces/states/ibase.state";
import { Supplier } from "../_models/supplier";
import { SupplierService } from "../_services/supplier.service";

export interface ISupplierState extends IBaseState, IBaseStateConnection {
  suppliers: Array<Supplier>;
}

export const initialState: ISupplierState = {
  isLoading: false,
  isUpdateLoading: false,
  suppliers: new Array<Supplier>(),
  endCursor: null,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
};

export const SupplierStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, supplierService = inject(SupplierService)) => ({
    getSuppliers: () => {
      patchState(store, { isLoading: true });
      return supplierService.getSuppliers(store.endCursor(), store.filterKeyword()).subscribe({
        next: (data) => {
          patchState(store, {
            suppliers: store.suppliers().concat(data.suppliers),
            endCursor: data.endCursor,
            isLoading: false
          });
        },
        error: (error) => {
          patchState(store, { error: error.message });
        },
      });
    },

    getAllSuppliers: () => {
      patchState(store, { isLoading: true });
      return supplierService.getAllSuppliers().subscribe({
        next: (suppliers: Array<Supplier>) => {
          patchState(store, {
            suppliers,
            isLoading: false
          });
        },
        error: (error) => {
          patchState(store, { error: error.message });
        },
      });
    },

    setSearchSuppliers: (keyword: string) => {
      patchState(store, { filterKeyword: keyword });
    },

    reset: () => {
      patchState(store, { ...initialState })
    },

    resetList: () => {
      patchState(store, { suppliers: initialState.suppliers, endCursor: initialState.endCursor });
    }
  }))
);
