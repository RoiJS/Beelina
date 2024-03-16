import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { Product } from 'src/app/_models/product';
import { ProductService } from 'src/app/_services/product.service';
import * as ProductActions from './actions';

@Injectable()
export class WarehouseProductEffects {
  warehouseProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.getWarehouseProductsAction),
      switchMap(() => {
        return this.productService.getWarehouseProducts().pipe(
          map(
            (data: {
              endCursor: string;
              hasNextPage: boolean;
              totalCount: number;
              products: Array<Product>;
            }) => {
              return ProductActions.getWarehouseProductsActionSuccess({
                products: data.products,
                endCursor: data.endCursor,
                hasNextPage: data.hasNextPage,
                totalCount: data.totalCount,
              });
            }
          ),
          catchError((error) =>
            of(
              ProductActions.getWarehouseProductsActionError({
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
  ) { }
}
