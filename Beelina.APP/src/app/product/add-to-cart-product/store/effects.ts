import { inject, Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { from, map, of, switchMap } from 'rxjs';

import * as ProductTransactionActions from './actions';

import { ProductTransaction, Transaction } from 'src/app/_models/transaction';
import { LocalOrdersDbService } from 'src/app/_services/local-db/local-orders-db.service';
import { StorageService } from 'src/app/_services/storage.service';
import {
  TransactionService,
} from 'src/app/_services/transaction.service';
import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';

@Injectable()
export class ProductTransactionsEffects {

  private actions$ = inject(Actions);
  private localOrdersDbService = inject(LocalOrdersDbService);
  private transactionService = inject(TransactionService);
  private storageService = inject(StorageService);

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
              productTransaction.id = p.id;
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
      ofType(ProductTransactionActions.getProductTransactions),
      switchMap((action: { transactionId: number, isLocalTransaction: boolean }) => {

        if (action.isLocalTransaction) {
          return from(this.localOrdersDbService.getMyLocalOrders(TransactionStatusEnum.ALL, [action.transactionId]))
            .pipe(
              map((transactions: Array<Transaction>) => {
                const transaction = transactions[0];
                return ProductTransactionActions.initializeTransactionDetails({
                  transaction,
                });
              })
            );
        }

        return this.transactionService
          .getTransaction(action.transactionId)
          .pipe(
            map((transaction: Transaction) => {
              return ProductTransactionActions.initializeTransactionDetails({
                transaction,
              });
            })
          );
      })
    )
  );


}
