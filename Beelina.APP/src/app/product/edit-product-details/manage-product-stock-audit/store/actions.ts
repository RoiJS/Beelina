import { createAction, props } from '@ngrx/store';
import { ProductStockAudit } from 'src/app/_models/product-stock-audit';

export const getProductStockAuditsAction = createAction(
  '[Product Stock Audit] Get Product Stock Audits',
  props<{ productId: number; userAccountId: number }>()
);

export const getProductStockAuditsActionSuccess = createAction(
  '[Product Stock Audit] Get Product Stock Audits Success',
  props<{
    endCursor: string;
    hasNextPage: boolean;
    productStockAudits: Array<ProductStockAudit>;
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

export const resetProductStockAuditsState = createAction('[Product Stock Audit] Reset Product Stock Audits State');
