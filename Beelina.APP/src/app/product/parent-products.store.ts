import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { tap, finalize, catchError, of } from "rxjs";

import { IBaseState } from "../_interfaces/states/ibase.state";
import { Product } from "../_models/product";
import { ProductService } from "../_services/product.service";

export interface IParentProductState extends IBaseState {
  parentProducts: Array<Product>;
}

export const initialState: IParentProductState = {
  isLoading: false,
  isUpdateLoading: false,
  parentProducts: new Array<Product>(),
  error: null,
};

export const ParentProductStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, productService = inject(ProductService)) => ({
    getParentProducts: (filterKeyword: string = '') => {
      patchState(store, { isLoading: true });
      return productService.getParentProducts(filterKeyword).pipe(
        tap((parentProducts: Array<Product>) => {
          patchState(store, {
            parentProducts,
            isLoading: false
          });
        }),
        catchError((error) => {
          patchState(store, { error: error.message, isLoading: false });
          return of([]); // Return empty array on error
        }),
        finalize(() => {
          patchState(store, { isLoading: false });
        })
      );
    },

    searchParentProducts: (filterKeyword: string) => {
      patchState(store, { isLoading: true });
      return productService.getParentProducts(filterKeyword).pipe(
        tap((parentProducts: Array<Product>) => {
          patchState(store, {
            parentProducts,
            isLoading: false
          });
        }),
        catchError((error) => {
          patchState(store, { error: error.message, isLoading: false });
          return of([]); // Return empty array on error
        }),
        finalize(() => {
          patchState(store, { isLoading: false });
        })
      );
    },

    reset: () => {
      patchState(store, { ...initialState })
    },
  }))
);
