import { IPaymentMethodInput } from "./ipayment-method.input";

export interface IStoreInput {
  id: number;
  name: string;
  address: string;
  paymentMethodInput: IPaymentMethodInput;
}
