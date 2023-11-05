import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, delay, map, of, switchMap } from 'rxjs';

import * as TransactionDatesActions from './actions';
import {
  TransactionDateInformation,
  TransactionService,
} from 'src/app/_services/transaction.service';
import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';

@Injectable()
export class TransactionDatesEffects {
  getTransactionDates$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionDatesActions.getTransactionDatesAction),
      switchMap((action: { transactionStatus: TransactionStatusEnum }) => {
        return this.transactionService
          .getTransactioDates(action.transactionStatus)
          .pipe(
            delay(1000),
            map(
              (data: {
                endCursor: string;
                hasNextPage: boolean;
                transactionDates: Array<TransactionDateInformation>;
              }) => {
                return TransactionDatesActions.getTransactionDatesActionSuccess(
                  {
                    transactionDates: data.transactionDates,
                    endCursor: data.endCursor,
                    hasNextPage: data.hasNextPage,
                  }
                );
              }
            ),
            catchError((error) =>
              of(
                TransactionDatesActions.getTransactionDatesActionError({
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
    private transactionService: TransactionService
  ) {}
}
