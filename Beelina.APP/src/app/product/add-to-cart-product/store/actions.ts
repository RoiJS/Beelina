import { createAction, props } from '@ngrx/store';
import { ProductTransaction } from 'src/app/_models/transaction';

export const initializeProductTransactions = createAction(
  '[Transaction] Initialize Product Transactions'
);

export const initializeProductTransactionsSuccess = createAction(
  '[Transaction] Initialize Product Transactions Success',
  props<{ productTransactions: Array<ProductTransaction> }>()
);

export const selectProduct = createAction(
  '[Transaction] Select Product',
  props<{ productId: number; price: number; quantity: number; name: string }>()
);

export const setSaveOrderLoadingState = createAction(
  '[Transaction] Set SaveOrder Loading State',
  props<{ state: boolean }>()
);

export const resetProductTransactionState = createAction(
  '[Transaction] Reset Transaction State'
);
