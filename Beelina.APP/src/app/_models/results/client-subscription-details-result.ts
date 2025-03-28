import { ClientSubscriptionDetails } from '../client-subscription-details.model';
import { IClientSubscriptionDetailsPayload } from 'src/app/_interfaces/payloads/iclient-subscription-details.payload';

export class ClientSubscriptionDetailsResult
  extends ClientSubscriptionDetails
  implements IClientSubscriptionDetailsPayload {
  public typename: string;
}
