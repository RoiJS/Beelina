import { createReducer, on } from '@ngrx/store';
import { mutableOn } from 'ngrx-etc';
import { ProductTransaction } from 'src/app/_models/transaction';

import * as ProductTransactionActions from './actions';
import { IProductTransactionState } from './types/product-transaction-state.interface';

export const initialState: IProductTransactionState = {
  isLoading: false,
  isUpdateLoading: false,
  error: null,
  currentIdx: 0,
  productTransactions: new Array<ProductTransaction>(),
};

export const reducers = createReducer(
  initialState,
  mutableOn(
    ProductTransactionActions.initializeProductTransactionsSuccess,
    (state, action) => {
      state.productTransactions = action.productTransactions;
    }
  ),
  mutableOn(ProductTransactionActions.selectProduct, (state, action) => {
    const productIdx = state.productTransactions.findIndex(
      (p) => p.productId === action.productId
    );

    const productTransaction = new ProductTransaction();
    productTransaction.productId = action.productId;
    productTransaction.productName = action.name;
    productTransaction.price = action.price;
    productTransaction.quantity = action.quantity;

    if (productIdx < 0) {
      let newIdx = state.currentIdx - 1;
      productTransaction.id = newIdx;
      state.currentIdx = newIdx;
      state.productTransactions.push(productTransaction);
    } else {
      if (action.quantity !== 0)
        state.productTransactions[productIdx] = productTransaction;
      else state.productTransactions.splice(productIdx, 1);
    }
  }),
  mutableOn(
    ProductTransactionActions.setSaveOrderLoadingState,
    (state, action) => {
      state.isUpdateLoading = action.state;
    }
  ),
  mutableOn(
    ProductTransactionActions.resetProductTransactionState,
    (state, action) => {
      state.productTransactions = initialState.productTransactions;
    }
  )
);
