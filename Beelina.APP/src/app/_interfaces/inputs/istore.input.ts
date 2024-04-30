import { OutletTypeEnum } from "src/app/_enum/outlet-type.enum";
import { IPaymentMethodInput } from "./ipayment-method.input";

export interface IStoreInput {
  id: number;
  name: string;
  address: string;
  emailAddress: string;
  outletType: OutletTypeEnum;
  paymentMethodInput: IPaymentMethodInput;
  barangayInput: IPaymentMethodInput;
}
