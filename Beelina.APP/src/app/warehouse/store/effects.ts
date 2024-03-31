import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, takeUntil } from 'rxjs';

import { Product } from 'src/app/_models/product';
import { ProductService } from 'src/app/_services/product.service';
import * as ProductActions from './actions';
import { IProductPayload } from 'src/app/_interfaces/payloads/iproduct.payload';

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
          takeUntil(this.actions$.pipe(ofType(ProductActions.getWarehouseProductsCancelAction))),
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

  importWarehouseProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.importWarehouseProductsAction),
      switchMap((action: { products: Array<Product> }) => {
        return this.productService.updateWarehouseProductInformation(action.products).pipe(
          map((importedProducts: Array<IProductPayload>) => ProductActions.importWarehouseProductsActionSuccess({ importedProducts })),
          takeUntil(this.actions$.pipe(ofType(ProductActions.importWarehouseProductsCancelAction))),
          catchError((error) =>
            of(
              ProductActions.importWarehouseProductsActionError({
                error: error.message,
              })
            )
          )
        )
      })
    )
  );
  constructor(
    private actions$: Actions,
    private productService: ProductService,
  ) { }
}
