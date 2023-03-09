import { createAction, props } from '@ngrx/store';
import { PaymentMethod } from 'src/app/_services/payment-method.service';

export const getPaymentMethodsAction = createAction(
  '[Payment Methods] Get Payment Methods'
);

export const getPaymentMethodsActionSuccess = createAction(
  '[Payment Methods] Get Payment Methods Success',
  props<{
    endCursor: string;
    hasNextPage: boolean;
    paymentMethods: Array<PaymentMethod>;
  }>()
);

export const getPaymentMethodsActionError = createAction(
  '[Payment Methods] Get Payment Methods Error',
  props<{ error: string }>()
);
