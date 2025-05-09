import { createReducer, on } from '@ngrx/store';
import { ProductTransaction, ProductTransactionQuantityHistory, Transaction } from 'src/app/_models/transaction';

import * as ProductTransactionActions from './actions';
import { IProductTransactionState } from './types/product-transaction-state.interface';

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
  on(
    ProductTransactionActions.initializeProductTransactionsSuccess,
    (state, action) => ({
      ...state,
      productTransactions: action.productTransactions,
    })
  ),
  on(
    ProductTransactionActions.getProductTransactions,
    (state, action) => ({
      ...state,
      isLoading: true,
    })
  ),
  on(ProductTransactionActions.selectProduct, (state, action) => {
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

    const newState = {
      ...state,
    };

    if (productIdx < 0) {
      productTransaction.id = state.currentIdx;
      newState.currentIdx = state.currentIdx - 1;
      newState.productTransactions = [...state.productTransactions, productTransaction];
    } else {
      const currentProductTransaction = state.productTransactions.find(
        (p) => p.productId === action.productId
      );

      if (action.quantity !== 0) {
        const productTransactionQuantityHistory = new ProductTransactionQuantityHistory();
        productTransactionQuantityHistory.quantity = productTransaction.currentQuantity;

        productTransaction.id = currentProductTransaction.id;
        productTransaction.currentQuantity = currentProductTransaction.currentQuantity;

        if (action.quantity !== productTransaction.currentQuantity) {
          productTransaction.productTransactionQuantityHistory = [
            ...currentProductTransaction.productTransactionQuantityHistory,
            productTransactionQuantityHistory,
          ];
        }

        newState.productTransactions = state.productTransactions.map((p) =>
          p.id === productTransaction.id ? productTransaction : p
        );
      } else {
        newState.productTransactions = state.productTransactions.filter(
          (p) => p.id !== currentProductTransaction.id
        );
      }
    }

    return newState;
  }),
  on(
    ProductTransactionActions.setSaveOrderLoadingState,
    (state, action) => ({
      ...state,
      isUpdateLoading: action.state,
    })
  ),
  on(
    ProductTransactionActions.resetProductTransactionState,
    (state, action) => ({
      ...state,
      productTransactions: initialState.productTransactions,
    })
  ),
  on(
    ProductTransactionActions.resetTransactionState,
    (state, action) => ({
      ...state,
      transaction: initialState.transaction,
    })
  ),
  on(
    ProductTransactionActions.initializeTransactionDetails,
    (state, action) => ({
      ...state,
      isLoading: false,
      transaction: action.transaction,
      productTransactions: action.transaction.productTransactions,
    })
  )
);
