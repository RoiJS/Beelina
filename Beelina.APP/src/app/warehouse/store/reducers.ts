import { createReducer, on } from '@ngrx/store';

import { Product } from '../../_models/product';
import { IProductState } from '../../product/types/product-state.interface';
import * as ProductActions from './actions';

export const initialState: IProductState = {
  isLoading: false,
  isUpdateLoading: false,
  products: new Array<Product>(),
  textProductInventories: new Array<Product>(),
  endCursor: null,
  totalCount: 0,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
};

export const reducers = createReducer(
  initialState,
  on(
    ProductActions.getWarehouseProductsAction,
    (state, action) =>
      <IProductState>{
        ...state,
        isLoading: (state.endCursor === null),
      }
  ),
  on(
    ProductActions.getWarehouseProductsActionSuccess,
    (state, action) =>
      <IProductState>{
        ...state,
        isLoading: false,
        endCursor: action.endCursor,
        totalCount: action.totalCount,
        products: state.products.concat(action.products),
      }
  ),
  on(
    ProductActions.getWarehouseProductsActionError,
    (state, action) =>
      <IProductState>{
        ...state,
        isLoading: false,
        error: action.error,
      }
  ),
  on(
    ProductActions.setUpdateWarehouseProductLoadingState,
    (state, action) =>
      <IProductState>{
        ...state,
        isLoading: action.state,
      }
  ),
  on(ProductActions.setSearchWarehouseProductAction, (state, action) => ({
    ...state,
    filterKeyword: action.keyword,
  })),
  on(ProductActions.resetWarehouseProductState, (state, action) =>
  (<IProductState>{
    ...initialState,
    filterKeyword: state.filterKeyword
  })),
);
