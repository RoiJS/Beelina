import { createReducer, on } from '@ngrx/store';

import * as ProductStockAuditActions from './actions';
import { IProductStockAuditState } from './types/product-state.interface';
import { SortOrderOptionsEnum } from 'src/app/_enum/sort-order-options.enum';
import { ProductStockAuditItem } from 'src/app/_models/product-stock-audit-item';
import { StockAuditSourceEnum } from 'src/app/_enum/stock-audit-source.enum';

export const initialState: IProductStockAuditState = {
  isLoading: false,
  isUpdateLoading: false,
  productStockAuditItems: new Array<ProductStockAuditItem>(),
  endCursor: null,
  filterKeyword: '',
  fromDate: null,
  toDate: null,
  sortOrder: SortOrderOptionsEnum.DESCENDING,
  stockAuditSource: StockAuditSourceEnum.None,
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
        productStockAuditItems: state.productStockAuditItems.concat(action.productStockAuditItems),
      }
  ),
  on(
    ProductStockAuditActions.setSortAndfilterStockAuditsAction,
    (state, action) => ({
      ...state,
      sortOrder: action.sortOrder,
      fromDate: action.dateStart,
      toDate: action.dateEnd,
    })
  ),
  on(
    ProductStockAuditActions.getProductStockAuditsActionError,
    (state, action) =>
      <IProductStockAuditState>{
        ...state,
        error: action.error,
      }
  ),
  on(ProductStockAuditActions.resetProductStockAuditItemsState, (state, action) => ({
    ...state,
    productStockAuditItems: initialState.productStockAuditItems,
    endCursor: initialState.endCursor,
  }))
);
