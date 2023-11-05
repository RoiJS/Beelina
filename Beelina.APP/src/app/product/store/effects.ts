import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, delay, map, of, switchMap } from 'rxjs';

import { Product } from 'src/app/_models/product';
import { ProductTransaction } from 'src/app/_models/transaction';

import { ProductService } from 'src/app/_services/product.service';

import * as ProductActions from './actions';
import * as ProductTransactionActions from '../add-to-cart-product/store/actions';

@Injectable()
export class ProductEffects {
  paymentMethods$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.getProductsAction),
      switchMap(() => {
        return this.productService.getProducts().pipe(
          delay(1000),
          map(
            (data: {
              endCursor: string;
              hasNextPage: boolean;
              products: Array<Product>;
            }) => {
              return ProductActions.getProductsActionSuccess({
                products: data.products,
                endCursor: data.endCursor,
                hasNextPage: data.hasNextPage,
              });
            }
          ),
          catchError((error) =>
            of(
              ProductActions.getProductsActionError({
                error: error.message,
              })
            )
          )
        );
      })
    )
  );

  analyzeTextOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.analyzeTextOrders),
      switchMap((action: { textOrders: string }) => {
        return this.productService.analyzeTextOrders(action.textOrders).pipe(
          map((productTransactions: Array<ProductTransaction>) => {
            return ProductTransactionActions.initializeProductTransactionsSuccess(
              {
                productTransactions,
              }
            );
          }),
          catchError((error) =>
            of(
              ProductActions.getProductsActionError({
                error: error.message,
              })
            )
          )
        );
      })
    )
  );
  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}
