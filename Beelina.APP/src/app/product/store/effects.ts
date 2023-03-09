import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, map, of, switchMap } from 'rxjs';
import { Product, ProductService } from 'src/app/_services/product.service';

import * as ProductActions from './actions';

@Injectable()
export class ProductEffects {
  paymentMethods$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.getProductsAction),
      switchMap(() => {
        return this.productService.getProducts().pipe(
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
  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}
