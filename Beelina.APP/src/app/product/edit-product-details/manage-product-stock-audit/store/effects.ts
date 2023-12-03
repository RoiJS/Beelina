import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { ProductService } from 'src/app/_services/product.service';
import { ProductStockAudit } from 'src/app/_models/product-stock-audit';

import * as ProductStockAuditActions from './actions';

@Injectable()
export class ProductStockAuditEffects {
  productStockAudits$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductStockAuditActions.getProductStockAuditsAction),
      switchMap((action: { productId: number, userAccountId: number }) => {
        return this.productService.getProductStockAuditList(action.productId, action.userAccountId).pipe(
          map(
            (data: {
              endCursor: string;
              hasNextPage: boolean;
              productStockAudits: Array<ProductStockAudit>;
            }) => {
              return ProductStockAuditActions.getProductStockAuditsActionSuccess({
                productStockAudits: data.productStockAudits,
                endCursor: data.endCursor,
                hasNextPage: data.hasNextPage,
              });
            }
          ),
          catchError((error) =>
            of(
              ProductStockAuditActions.getProductStockAuditsActionError({
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
  ) { }
}
