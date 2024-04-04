import { TopSellingProduct } from "src/app/_services/transaction.service";
import { ITopSellingProductsState } from "./top-selling-product-state.interface";
import { createReducer, on } from "@ngrx/store";

import * as TopSellingProductActions from './actions';
import { SortOrderOptionsEnum } from "src/app/_enum/sort-order-options.enum";

export const initialState: ITopSellingProductsState = {
  isLoading: false,
  isUpdateLoading: false,
  topSellingProducts: new Array<TopSellingProduct>(),
  endCursor: null,
  totalCount: 0,
  filterKeyword: '',
  fromDate: null,
  toDate: null,
  sortOrder: SortOrderOptionsEnum.DESCENDING,
  hasNextPage: false,
  error: null,
};

export const reducers = createReducer(
  initialState,
  on(
    TopSellingProductActions.getTopSellingProductsAction,
    (state, action) =>
      <ITopSellingProductsState>{
        ...state,
        isLoading: (state.endCursor === null),
      }
  ),
  on(
    TopSellingProductActions.getTopSellingProductsActionSuccess,
    (state, action) =>
      <ITopSellingProductsState>{
        ...state,
        isLoading: false,
        endCursor: action.endCursor,
        totalCount: action.totalCount,
        topSellingProducts: state.topSellingProducts.concat(action.topSellingProducts),
      }
  ),
  on(
    TopSellingProductActions.getTopSellingProductsActionError,
    (state, action) =>
      <ITopSellingProductsState>{
        ...state,
        isLoading: false,
        error: action.error,
      }
  ),
  on(
    TopSellingProductActions.setSortAndfilterTopSellingProductsDatesAction,
    (state, action) => ({
      ...state,
      sortOrder: action.sortOrder,
      fromDate: action.dateStart,
      toDate: action.dateEnd,
    })
  ),
  on(TopSellingProductActions.setUpdateTopProductLoadingState,
    (state, action) =>
      <ITopSellingProductsState>{
        ...state,
        isLoading: action.state,
      }
  ),
  on(TopSellingProductActions.resetTopSellingProductState, (state, action) =>
  (<ITopSellingProductsState>{
    ...state,
    topSellingProducts: initialState.topSellingProducts,
    endCursor: initialState.endCursor,
  }))
);
