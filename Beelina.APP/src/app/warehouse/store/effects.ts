import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, take, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { IProductPayload } from 'src/app/_interfaces/payloads/iproduct.payload';
import { Product } from 'src/app/_models/product';
import { ProductService } from 'src/app/_services/product.service';
import {
  endCursorSelector as endCursorWarehouseProductSelector,
  filterKeywordSelector as filterKeywordWarehouseProductSelector,
  supplierIdSelector as supplierIdWarehouseProductSelector,
} from '../../warehouse/store/selectors';
import * as ProductActions from './actions';

@Injectable()
export class WarehouseProductEffects {
  warehouseProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.getWarehouseProductsAction),
      switchMap(() => {

        let cursor = null,
          supplierId = 0,
          limit = 50,
          filterKeyword = '';

        this.store
          .select(endCursorWarehouseProductSelector)
          .pipe(take(1))
          .subscribe((currentCursor) => (cursor = currentCursor));

        this.store
          .select(filterKeywordWarehouseProductSelector)
          .pipe(take(1))
          .subscribe(
            (currentFilterKeyword) => (filterKeyword = currentFilterKeyword)
          );

        this.store
          .select(supplierIdWarehouseProductSelector)
          .pipe(take(1))
          .subscribe(
            (currentSupplierId) => (supplierId = currentSupplierId)
          );

        return this.productService.getWarehouseProducts(cursor, supplierId, filterKeyword, limit).pipe(
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
    private store: Store<AppStateInterface>
  ) { }
}
