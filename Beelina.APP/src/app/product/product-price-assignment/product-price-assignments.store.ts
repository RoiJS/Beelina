import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";

import { IBaseStateConnection } from "../../_interfaces/states/ibase-connection.state";
import { IBaseState } from "../../_interfaces/states/ibase.state";
import { ProductService } from "../../_services/product.service";
import { SortOrderOptionsEnum } from "../../_enum/sort-order-options.enum";
import { Product } from "../../_models/product";
import { ProductsFilter } from "../../_models/filters/products.filter";

export interface IProductPriceAssignmentsState extends IBaseState, IBaseStateConnection {
  productAssignments: Array<Product>;
  userAccountId: number;
  totalCount: number;
  sortField: string;
  sortDirection: SortOrderOptionsEnum;
  productsFilter: ProductsFilter;
}

export const initialState: IProductPriceAssignmentsState = {
  isLoading: false,
  isUpdateLoading: false,
  productAssignments: [],
  skip: 0,
  take: 10,
  userAccountId: 0,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
  totalCount: 0,
  sortDirection: SortOrderOptionsEnum.DESCENDING,
  sortField: "",
  productsFilter: new ProductsFilter()
};

export const ProductPriceAssignmentsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, productService = inject(ProductService)) => ({
    getProductAssignments: () => {
      patchState(store, { isLoading: true });
      return productService.getProductPriceAssignments(
        store.userAccountId(),
        store.filterKeyword(),
        store.productsFilter(),
        store.skip(),
        store.take(),
        store.sortField(),
        store.sortDirection()
      ).subscribe({
        next: (data) => {
          // Support both paged and non-paged GraphQL responses
          let assignments: Product[] = [];
          let totalCount = 0;
          if (data?.priceAssignments) {
            if (Array.isArray(data.priceAssignments)) {
              assignments = data.priceAssignments;
              totalCount = data.totalCount ?? data.priceAssignments.length;
            }
          }

          patchState(store, {
            productAssignments: assignments,
            totalCount: totalCount,
            isLoading: false
          });
        },
        error: (error) => {
          patchState(store, { error: error.message, isLoading: false });
        },
      });
    },

    setUserAccountId: (userAccountId: number) => {
      patchState(store, { userAccountId });
    },

    setPagination: (skip: number, take: number) => {
      patchState(store, { skip: (skip || store.skip()), take: (take || store.take()) });
    },

    setSort: (sortField: string, sortDirection: SortOrderOptionsEnum) => {
      patchState(store, { sortField, sortDirection });
    },

    setSearchFilterKeyword: (keyword: string) => {
      patchState(store, { filterKeyword: keyword });
    },

    setProductsFilter: (productsFilter: ProductsFilter) => {
      patchState(store, { productsFilter });
    },

    reset: () => {
      patchState(store, { ...initialState, userAccountId: store.userAccountId() });
    },

    resetList: () => {
      patchState(store, { productAssignments: initialState.productAssignments });
    }
  }))
);
