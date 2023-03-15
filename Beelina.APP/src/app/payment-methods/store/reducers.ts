import { createReducer, on } from '@ngrx/store';
import { PaymentMethod } from 'src/app/_models/payment-method';

import { IPaymentMethodState } from '../types/payment-method-state.interface';

import * as PaymentMethodActions from './actions';

export const initialState: IPaymentMethodState = {
  isLoading: false,
  isUpdateLoading: false,
  paymentMethods: new Array<PaymentMethod>(),
  endCursor: null,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
};

export const reducers = createReducer(
  initialState,
  on(
    PaymentMethodActions.getPaymentMethodsAction,
    (state, action) =>
      <IPaymentMethodState>{
        ...state,
        isLoading: true,
      }
  ),
  on(
    PaymentMethodActions.getPaymentMethodsActionSuccess,
    (state, action) =>
      <IPaymentMethodState>{
        ...state,
        isLoading: false,
        endCursor: action.endCursor,
        paymentMethods: state.paymentMethods.concat(action.paymentMethods),
      }
  ),
  on(
    PaymentMethodActions.getPaymentMethodsActionError,
    (state, action) =>
      <IPaymentMethodState>{
        ...state,
        error: action.error,
      }
  )
);
