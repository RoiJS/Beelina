import { createAction, props } from '@ngrx/store';
import { ProductTransaction } from 'src/app/_models/transaction';
import { Transaction } from 'src/app/_services/transaction.service';

export const initializeProductTransactions = createAction(
  '[Transaction] Initialize Product Transactions'
);

export const initializeProductTransactionsSuccess = createAction(
  '[Transaction] Initialize Product Transactions Success',
  props<{ productTransactions: Array<ProductTransaction> }>()
);

export const getProductTransactionsFromServer = createAction(
  '[Transaction] Get Product Transactions From Server',
  props<{ transactionId: number }>()
);

export const initializeTransactionDetails = createAction(
  '[Transaction] Initialize Transaction Details',
  props<{ transaction: Transaction }>()
);

export const selectProduct = createAction(
  '[Transaction] Select Product',
  props<{ productId: number; price: number; quantity: number; name: string }>()
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
