import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, map, of, switchMap } from 'rxjs';

import * as ProductUnitActions from './actions';

import {
  ProductUnit,
  ProductUnitService,
} from 'src/app/_services/product-unit.service';

@Injectable()
export class ProductUnitEffects {
  paymentMethods$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductUnitActions.getProductUnitsAction),
      switchMap(() => {
        return this.productUnitService.getProductUnits().pipe(
          map(
            (data: {
              endCursor: string;
              hasNextPage: boolean;
              productUnits: Array<ProductUnit>;
            }) => {
              return ProductUnitActions.getProductUnitsActionSuccess({
                productUnits: data.productUnits,
                endCursor: data.endCursor,
                hasNextPage: data.hasNextPage,
              });
            }
          ),
          catchError((error) =>
            of(
              ProductUnitActions.getProductUnitsActionError({
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
    private productUnitService: ProductUnitService
  ) {}
}
