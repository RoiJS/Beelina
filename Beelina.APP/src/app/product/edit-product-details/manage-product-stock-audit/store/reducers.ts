import { createReducer, on } from '@ngrx/store';

import * as ProductStockAuditActions from './actions';
import { IProductStockAuditState } from './types/product-state.interface';
import { ProductStockAudit } from 'src/app/_models/product-stock-audit';

export const initialState: IProductStockAuditState = {
  isLoading: false,
  isUpdateLoading: false,
  productStockAudits: new Array<ProductStockAudit>(),
  endCursor: null,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
};

export const reducers = createReducer(
  initialState,
  on(
    ProductStockAuditActions.getProductStockAuditsAction,
    (state, action) =>
      <IProductStockAuditState>{
        ...state,
        isLoading: true,
      }
  ),
  on(
    ProductStockAuditActions.getProductStockAuditsActionSuccess,
    (state, action) =>
      <IProductStockAuditState>{
        ...state,
        isLoading: false,
        endCursor: action.endCursor,
        productStockAudits: state.productStockAudits.concat(action.productStockAudits),
      }
  ),
  on(
    ProductStockAuditActions.getProductStockAuditsActionError,
    (state, action) =>
      <IProductStockAuditState>{
        ...state,
        error: action.error,
      }
  ),
  on(ProductStockAuditActions.resetProductStockAuditsState, (state, action) => ({
    ...initialState,
  }))
);
