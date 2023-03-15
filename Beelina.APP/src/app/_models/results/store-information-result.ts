import { IStoreInformationQueryPayload } from 'src/app/_interfaces/payloads/istore-information-query.payload';
import { PaymentMethod } from '../payment-method';

export class StoreInformationResult implements IStoreInformationQueryPayload {
  public typename: string;
  public name: string;
  public address: string;
  public paymentMethod: PaymentMethod;
}
