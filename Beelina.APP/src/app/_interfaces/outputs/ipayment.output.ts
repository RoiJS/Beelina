import { IBaseError } from '../errors/ibase.error';
import { IPaymentPayload } from '../payloads/ipayment.payload';

export interface IPaymentOutput {
  payment: IPaymentPayload;
  errors: Array<IBaseError>;
}
