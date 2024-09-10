import { createAction, props } from '@ngrx/store';
import { ProductTransaction, Transaction } from 'src/app/_models/transaction';

export const initializeProductTransactions = createAction(
  '[Transaction] Initialize Product Transactions'
);

export const initializeProductTransactionsSuccess = createAction(
  '[Transaction] Initialize Product Transactions Success',
  props<{ productTransactions: Array<ProductTransaction> }>()
);

export const getProductTransactions = createAction(
  '[Transaction] Get Product Transactions',
  props<{ transactionId: number; isLocalTransaction: boolean; }>()
);

export const initializeTransactionDetails = createAction(
  '[Transaction] Initialize Transaction Details',
  props<{ transaction: Transaction }>()
);

export const selectProduct = createAction(
  '[Transaction] Select Product',
  props<{
    code: string;
    productId: number;
    price: number;
    quantity: number;
    name: string;
  }>()
);

export const setSaveOrderLoadingState = createAction(
  '[Transaction] Set SaveOrder Loading State',
  props<{ state: boolean }>()
);

export const resetTransactionState = createAction(
  '[Transaction] Reset Transaction State'
);

export const resetProductTransactionState = createAction(
  '[Transaction] Reset Product Transaction State'
);
