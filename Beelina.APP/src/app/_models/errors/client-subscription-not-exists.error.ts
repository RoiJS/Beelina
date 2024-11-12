import { IBaseError } from 'src/app/_interfaces/errors/ibase.error';
import { IClientSubscriptionDetailsPayload } from 'src/app/_interfaces/payloads/iclient-subscription-details.payload';

export class ClientSubscriptionNotExistsError
  implements IClientSubscriptionDetailsPayload, IBaseError {
  public typename: string;
  public code: string;
  public message: string;
}
