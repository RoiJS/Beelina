import { IBaseStateConnection } from 'src/app/_interfaces/states/ibase-connection.state';
import { IBaseState } from 'src/app/_interfaces/states/ibase.state';
import { PaymentMethod } from 'src/app/_models/payment-method';

export interface IPaymentMethodState extends IBaseState, IBaseStateConnection {
  paymentMethods: Array<PaymentMethod>;
}
