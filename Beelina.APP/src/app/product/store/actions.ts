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
  props<{ deduction: number, productId: number }>()
);

export const resetProductState = createAction('[Product] Reset Product State');
