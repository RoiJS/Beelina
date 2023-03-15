import { createReducer, on } from '@ngrx/store';
import { ProductUnit } from 'src/app/_models/product-unit';

import { IProductUnitState } from '../types/product-unit-state.interface';

import * as ProductUnitActions from './actions';

export const initialState: IProductUnitState = {
  isLoading: false,
  isUpdateLoading: false,
  productUnits: new Array<ProductUnit>(),
  endCursor: null,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
};

export const reducers = createReducer(
  initialState,
  on(
    ProductUnitActions.getProductUnitsAction,
    (state, action) =>
      <IProductUnitState>{
        ...state,
        isLoading: true,
      }
  ),
  on(
    ProductUnitActions.getProductUnitsActionSuccess,
    (state, action) =>
      <IProductUnitState>{
        ...state,
        isLoading: false,
        endCursor: action.endCursor,
        productUnits: state.productUnits.concat(action.productUnits),
      }
  ),
  on(
    ProductUnitActions.getProductUnitsActionError,
    (state, action) =>
      <IProductUnitState>{
        ...state,
        error: action.error,
      }
  )
);
