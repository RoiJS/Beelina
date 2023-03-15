import { createReducer, on } from '@ngrx/store';
import { Product } from 'src/app/_models/product';

import { IProductState } from '../types/product-state.interface';

import * as ProductActions from './actions';

export const initialState: IProductState = {
  isLoading: false,
  isUpdateLoading: false,
  products: new Array<Product>(),
  endCursor: null,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
};

export const reducers = createReducer(
  initialState,
  on(
    ProductActions.getProductsAction,
    (state, action) =>
      <IProductState>{
        ...state,
        isLoading: true,
      }
  ),
  on(
    ProductActions.getProductsActionSuccess,
    (state, action) =>
      <IProductState>{
        ...state,
        isLoading: false,
        endCursor: action.endCursor,
        products: state.products.concat(action.products),
      }
  ),
  on(
    ProductActions.getProductsActionError,
    (state, action) =>
      <IProductState>{
        ...state,
        error: action.error,
      }
  ),
  on(ProductActions.setSearchProductAction, (state, action) => ({
    ...state,
    filterKeyword: action.keyword,
  })),
  on(ProductActions.resetProductState, (state, action) => ({
    ...initialState,
  }))
);
