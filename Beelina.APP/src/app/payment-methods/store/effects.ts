import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, map, of, switchMap } from 'rxjs';

import * as PaymentMethodActions from './actions';

import { PaymentMethodService } from 'src/app/_services/payment-method.service';
import { PaymentMethod } from 'src/app/_models/payment-method';

@Injectable()
export class PaymentMethodsEffects {
  paymentMethods$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentMethodActions.getPaymentMethodsAction),
      switchMap(() => {
        return this.paymentMethodService.getPaymentMethods().pipe(
          map(
            (data: {
              endCursor: string;
              hasNextPage: boolean;
              paymentMethods: Array<PaymentMethod>;
            }) => {
              return PaymentMethodActions.getPaymentMethodsActionSuccess({
                paymentMethods: data.paymentMethods,
                endCursor: data.endCursor,
                hasNextPage: data.hasNextPage,
              });
            }
          ),
          catchError((error) =>
            of(
              PaymentMethodActions.getPaymentMethodsActionError({
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
    private paymentMethodService: PaymentMethodService
  ) {}
}
