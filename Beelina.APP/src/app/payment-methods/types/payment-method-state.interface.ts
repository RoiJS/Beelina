import { PaymentMethod } from 'src/app/_services/payment-method.service';

export interface IBaseStateConnection {
  hasNextPage: boolean;
  endCursor: string;
  filterKeyword: string;
}

export interface IBaseState {
  isLoading: boolean;
  isUpdateLoading: boolean;
  error: string;
}

export interface IPaymentMethodState extends IBaseState, IBaseStateConnection {
  paymentMethods: Array<PaymentMethod>;
}
