import { createAction, props } from '@ngrx/store';
import { Product } from 'src/app/_models/product';

export const getProductsAction = createAction('[Product] Get Products');

export const getProductsActionSuccess = createAction(
  '[Product] Get Product Success',
  props<{
    endCursor: string;
    hasNextPage: boolean;
    products: Array<Product>;
  }>()
);

export const analyzeTextInventories = createAction(
  '[Product] Analyze Text Inventories',
  props<{ textInventories: string }>()
);

export const analyzeTextInventoriesActionSuccess = createAction(
  '[Product] Analyze Text Inventories Success',
  props<{
    textProductInventories: Array<Product>;
  }>()
);

export const getProductsActionError = createAction(
  '[Product] Get Product Error',
  props<{ error: string }>()
);

export const setUpdateProductLoadingState = createAction(
  '[Product] Set Update Product Loading State',
  props<{ state: boolean }>()
);

export const setSearchProductAction = createAction(
  '[Product] Search Products',
  props<{ keyword: string }>()
);

export const setProductDeductionAction = createAction(
  '[Product] Set Product Deduction',
  props<{ deduction: number; productId: number }>()
);

export const analyzeTextOrders = createAction(
  '[Product] Analyze Text Orders',
  props<{ textOrders: string }>()
);

export const resetProductState = createAction('[Product] Reset Product State');

export const resetTextInventoriesState = createAction('[Product] Reset Text Inventories State');
