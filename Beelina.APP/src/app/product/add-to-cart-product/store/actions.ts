import { createAction, props } from '@ngrx/store';

export const selectProduct = createAction(
  '[Transaction] Select Product',
  props<{ productId: number; price: number; quantity: number }>()
);

export const setSaveOrderLoadingState = createAction(
  '[Transaction] Set SaveOrder Loading State',
  props<{ state: boolean }>()
);

export const resetProductTransactionState = createAction(
  '[Transaction] Reset Transaction State'
);
