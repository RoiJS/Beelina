import { IStoreInformationQueryPayload } from 'src/app/_interfaces/payloads/istore-information-query.payload';
import { Barangay } from '../barangay';
import { PaymentMethod } from '../payment-method';
import { OutletTypeEnum } from 'src/app/_enum/outlet-type.enum';

export class StoreInformationResult implements IStoreInformationQueryPayload {
  public typename: string;
  public name: string;
  public address: string;
  public emailAddress: string;
  public outletType: OutletTypeEnum;
  public paymentMethod: PaymentMethod;
  public barangay: Barangay;
}
