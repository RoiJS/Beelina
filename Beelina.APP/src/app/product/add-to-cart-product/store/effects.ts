import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { of, switchMap } from 'rxjs';

import * as ProductTransactionActions from './actions';

import { StorageService } from 'src/app/_services/storage.service';
import { ProductTransaction } from 'src/app/_models/transaction';

@Injectable()
export class ProductTransactionsEffects {
  productTransactions$ = createEffect(() =>
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
              productTransaction.productId = p.productId;
              productTransaction.productName = p.productName;
              productTransaction.price = p.price;
              productTransaction.quantity = p.quantity;
              return productTransaction;
            }),
          })
        );
      })
    )
  );
  constructor(
    private actions$: Actions,
    private storageService: StorageService
  ) {}
}
