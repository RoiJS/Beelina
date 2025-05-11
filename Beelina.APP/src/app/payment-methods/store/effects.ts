import { Actions, createEffect, ofType } from '@ngrx/effects';
import { inject, Injectable } from '@angular/core';
import { catchError, from, map, of, switchMap } from 'rxjs';

import * as PaymentMethodActions from './actions';
import { PaymentMethod } from 'src/app/_models/payment-method';

import { PaymentMethodService } from 'src/app/_services/payment-method.service';
import { LocalPaymentMethodsDbService } from 'src/app/_services/local-db/local-payment-methods-db.service';
import { NetworkService } from 'src/app/_services/network.service';

@Injectable()
export class PaymentMethodsEffects {

  private actions$ = inject(Actions);
  private paymentMethodService = inject(PaymentMethodService);
  private localPaymentMethodsDbService = inject(LocalPaymentMethodsDbService);
  private networkService = inject(NetworkService);

  paymentMethods$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentMethodActions.getPaymentMethodsAction),
      switchMap(() => {

        if (!this.networkService.isOnline.value) {
          return from(this.localPaymentMethodsDbService.getMyLocalPaymentMethods()).pipe(
            map((data: {
              endCursor: string;
              hasNextPage: boolean;
              paymentMethods: Array<PaymentMethod>;
            }) => {
              return PaymentMethodActions.getPaymentMethodsActionSuccess({
                paymentMethods: data.paymentMethods,
                endCursor: null,
                hasNextPage: data.hasNextPage,
              });
            })
          );
        }

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
}
