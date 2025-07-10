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

        // Get Local order
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

        // Get order from server
        if (action.transactionId > 0) {
          return this.transactionService
            .getTransaction(action.transactionId)
            .pipe(
              map((transaction: Transaction) => {
                return ProductTransactionActions.initializeTransactionDetails({
                  transaction,
                });
              })
            );
        } else {

          // Get order from local storage
          let formState = null;
          try {
            formState = JSON.parse(this.storageService.getString('productCartForm'));
          } catch (e) {
            console.error('Failed to parse productCartForm from local storage:', e);
          }
          const transaction = new Transaction();

          if (formState) {
            transaction.id = 0;
            transaction.badOrderAmount = 0;
            transaction.invoiceNo = formState.invoiceNo;
            transaction.discount = formState.discount;
            transaction.transactionDate = formState.transactionDate ? new Date(formState.transactionDate) : new Date();
            transaction.dueDate = formState.dueDate ? new Date(formState.dueDate) : new Date();
            transaction.storeId = formState.storeId;
            transaction.store = formState.store;
            transaction.modeOfPayment = formState.modeOfPayment;
          }

          let productTransactions: Array<ProductTransaction> = [];
          try {
            const parsed = JSON.parse(this.storageService.getString('productTransactions'));
            if (parsed) {
              productTransactions = <Array<ProductTransaction>>parsed;
            }
          } catch (e) {
            console.error('Failed to parse productTransactions from local storage:', e);
            productTransactions = [];
          }

          if (productTransactions && productTransactions.length > 0) {
            transaction.productTransactions = productTransactions.map((p) => {
              const productTransaction = new ProductTransaction();
              productTransaction.id = p.id;
              productTransaction.code = p.code;
              productTransaction.productId = p.productId;
              productTransaction.productName = p.productName;
              productTransaction.price = p.price;
              productTransaction.quantity = p.quantity;
              productTransaction.currentQuantity = p.currentQuantity;
              return productTransaction;
            });
          }

          return of(
            ProductTransactionActions.initializeTransactionDetails({
              transaction,
            })
          )
        }
      })
    )
  );
}
