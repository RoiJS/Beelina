import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { map, of, switchMap } from 'rxjs';

import * as ProductTransactionActions from './actions';

import { StorageService } from 'src/app/_services/storage.service';
import { ProductTransaction, Transaction } from 'src/app/_models/transaction';
import {
  TransactionService,
} from 'src/app/_services/transaction.service';

@Injectable()
export class ProductTransactionsEffects {
  productTransactionsFromLocalStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductTransactionActions.initializeProductTransactions),
      switchMap(() => {
        const productTransactions = <Array<ProductTransaction>>(
          JSON.parse(this.storageService.getString('productTransactions'))
        );

        if (!productTransactions) return of();

        return of(
          ProductTransactionActions.initializeProductTransactionsSuccess({
            productTransactions: productTransactions.map((p) => {
              const productTransaction = new ProductTransaction();
              productTransaction.code = p.code;
              productTransaction.productId = p.productId;
              productTransaction.productName = p.productName;
              productTransaction.price = p.price;
              productTransaction.quantity = p.quantity;
              productTransaction.currentQuantity = p.currentQuantity;
              return productTransaction;
            }),
          })
        );
      })
    )
  );

  productTransactionsFromServer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductTransactionActions.getProductTransactionsFromServer),
      switchMap((action: { transactionId: number }) => {
        return this.transactionService
          .getTransaction(action.transactionId)
          .pipe(
            map((transaction: Transaction) => {
              console.log(transaction);
              return ProductTransactionActions.initializeTransactionDetails({
                transaction,
              });
            })
          );
      })
    )
  );
  constructor(
    private actions$: Actions,
    private transactionService: TransactionService,
    private storageService: StorageService
  ) { }
}
