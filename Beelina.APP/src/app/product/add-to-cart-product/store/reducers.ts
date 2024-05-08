import { createReducer, on } from '@ngrx/store';
import { mutableOn } from 'ngrx-etc';
import { ProductTransaction } from 'src/app/_models/transaction';

import * as ProductTransactionActions from './actions';
import { IProductTransactionState } from './types/product-transaction-state.interface';
import { Transaction } from 'src/app/_services/transaction.service';

export const initialState: IProductTransactionState = {
  isLoading: false,
  isUpdateLoading: false,
  error: null,
  currentIdx: 0,
  transaction: new Transaction(),
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
    productTransaction.code = action.code;
    productTransaction.productId = action.productId;
    productTransaction.productName = action.name;
    productTransaction.price = action.price;
    productTransaction.quantity = action.quantity;
    productTransaction.currentQuantity = 0;

    if (productIdx < 0) {
      let newIdx = state.currentIdx - 1;
      productTransaction.id = 0;
      state.currentIdx = newIdx;
      state.productTransactions.push(productTransaction);
    } else {
      if (action.quantity !== 0) {
        const currentProductTransaction = state.productTransactions.find(
          (p) => p.productId === action.productId
        );
        productTransaction.id = currentProductTransaction.id;
        productTransaction.currentQuantity = currentProductTransaction.currentQuantity;
        state.productTransactions[productIdx] = productTransaction;
      }
      else {
        state.productTransactions.splice(productIdx, 1);
      }
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
  ),
  mutableOn(
    ProductTransactionActions.resetTransactionState,
    (state, action) => {
      state.transaction = initialState.transaction;
    }
  ),
  mutableOn(
    ProductTransactionActions.initializeTransactionDetails,
    (state, action) => {
      state.transaction = action.transaction;
      state.productTransactions = action.transaction.productTransactions;
    }
  )
);
