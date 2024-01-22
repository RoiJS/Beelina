import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { TransactionService, TopSellingProduct } from 'src/app/_services/transaction.service';

import * as TopSellingProductActions from '../store/actions';

@Injectable()
export class TopSellingProductEffects {
  topSellingProductss$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TopSellingProductActions.getTopSellingProductsAction),
      switchMap((action: { userId: number }) => {
        return this.transactionService.getTopSellingProducts(action.userId).pipe(
          map(
            (data: {
              endCursor: string;
              hasNextPage: boolean;
              totalCount: number;
              topSellingProducts: Array<TopSellingProduct>;
            }) => {
              return TopSellingProductActions.getTopSellingProductsActionSuccess({
                topSellingProducts: data.topSellingProducts,
                endCursor: data.endCursor,
                hasNextPage: data.hasNextPage,
                totalCount: data.totalCount,
              });
            }
          ),
          catchError((error) =>
            of(
              TopSellingProductActions.getTopSellingProductsActionError({
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
    private transactionService: TransactionService,
  ) { }
}
