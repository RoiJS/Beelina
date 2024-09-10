import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, map, of, switchMap, take } from 'rxjs';
import { Store } from '@ngrx/store';

import * as ProductUnitActions from './actions';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { ProductUnit } from 'src/app/_models/product-unit';
import { ProductUnitService } from 'src/app/_services/product-unit.service';
import { endCursorSelector } from './selectors';

@Injectable()
export class ProductUnitEffects {
  paymentMethods$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductUnitActions.getProductUnitsAction),
      switchMap(() => {
        let cursor = null;

        this.store
          .select(endCursorSelector)
          .pipe(take(1))
          .subscribe((currentCursor) => (cursor = currentCursor));

        return this.productUnitService.getProductUnits(cursor).pipe(
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
    private productUnitService: ProductUnitService,
    private store: Store<AppStateInterface>
  ) { }
}
