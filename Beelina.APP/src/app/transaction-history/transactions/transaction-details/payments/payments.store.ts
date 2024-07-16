import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";

import { PaymentService } from "src/app/_services/payments.service";
import { Payment } from "src/app/_models/payment";
import { IBaseState } from "src/app/_interfaces/states/ibase.state";
import { IBaseStateConnection } from "src/app/_interfaces/states/ibase-connection.state";

export interface IPaymentState extends IBaseState, IBaseStateConnection {
  payments: Array<Payment>;
}

export const initialState: IPaymentState = {
  isLoading: false,
  isUpdateLoading: false,
  payments: new Array<Payment>(),
  endCursor: null,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
};

export const PaymentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, paymentService = inject(PaymentService)) => ({
    getPayments: (transactionId: number) => {
      patchState(store, { isLoading: true });
      return paymentService.getPayments(store.endCursor(), transactionId).subscribe({
        next: (data) => {
          patchState(store, {
            payments: store.payments().concat(data.payments),
            endCursor: data.endCursor,
            isLoading: false
          });
        },
        error: (error) => {
          patchState(store, { error: error.message });
        },
      });
    },

    reset: () => {
      patchState(store, { ...initialState })
    },

    resetList: () => {
      patchState(store, { payments: initialState.payments, endCursor: initialState.endCursor });
    }
  }))
);
