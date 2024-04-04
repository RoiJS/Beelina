import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, takeUntil, tap } from 'rxjs';

import { Product } from 'src/app/_models/product';
import { ProductTransaction } from 'src/app/_models/transaction';

import { ProductService } from 'src/app/_services/product.service';
import { StorageService } from 'src/app/_services/storage.service';

import * as ProductTransactionActions from '../add-to-cart-product/store/actions';
import * as ProductActions from './actions';

@Injectable()
export class ProductEffects {
  products$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.getProductsAction),
      switchMap(() => {
        return this.productService.getProducts().pipe(
          map(
            (data: {
              endCursor: string;
              hasNextPage: boolean;
              totalCount: number;
              products: Array<Product>;
            }) => {
              return ProductActions.getProductsActionSuccess({
                products: data.products,
                endCursor: data.endCursor,
                hasNextPage: data.hasNextPage,
                totalCount: data.totalCount,
              });
            }
          ),
          takeUntil(this.actions$.pipe(ofType(ProductActions.getProductsCancelAction))),
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
          tap(() => {
            this.storageService.remove("textOrder");
            this.router.navigate([`product-catalogue/product-cart`]);
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

  analyzeTextInventories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.analyzeTextInventories),
      switchMap((action: { textInventories: string }) => {
        return this.productService.analyzeTextInventories(action.textInventories).pipe(
          map((textProductInventories: Array<Product>) => {
            return ProductActions.analyzeTextInventoriesActionSuccess(
              {
                textProductInventories,
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
    private productService: ProductService,
    private router: Router,
    private storageService: StorageService,
  ) { }
}
