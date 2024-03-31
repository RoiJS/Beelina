import { createAction, props } from '@ngrx/store';
import { SortOrderOptionsEnum } from 'src/app/_enum/sort-order-options.enum';
import { ProductStockAuditItem } from 'src/app/_models/product-stock-audit-item';

export const getProductStockAuditsAction = createAction(
  '[Product Stock Audit] Get Product Stock Audits',
  props<{ productId: number; userAccountId: number }>()
);

export const getWarehouseProductStockAuditsAction = createAction(
  '[Product Stock Audit] Get Warehouse Product Stock Audits',
  props<{ productId: number; warehouseId: number }>()
);

export const getProductStockAuditsActionSuccess = createAction(
  '[Product Stock Audit] Get Product Stock Audits Success',
  props<{
    endCursor: string;
    hasNextPage: boolean;
    productStockAuditItems: Array<ProductStockAuditItem>;
  }>()
);

export const getProductStockAuditsActionError = createAction(
  '[Product Stock Audit] Get Product Stock Audits Error',
  props<{ error: string }>()
);

export const setUpdateProductStockAuditsLoadingState = createAction(
  '[Product Stock Audit] Set Update Product Stock Audit Loading State',
  props<{ state: boolean }>()
);

export const setSortAndfilterStockAuditsAction = createAction(
  '[Product Stock Audit] Sort and Filter Stock Audits',
  props<{
    dateStart: string;
    dateEnd: string;
    sortOrder: SortOrderOptionsEnum;
  }>()
);

export const resetProductStockAuditItemsState = createAction('[Product Stock Audit] Reset Product Stock Audits State');
