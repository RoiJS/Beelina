import { IBaseError } from '../errors/ibase.error';
import { IClientSubscriptionPayload } from '../payloads/iclient-subscription.payload';

export interface IClientSubscriptionOutput {
  clientSubscription: IClientSubscriptionPayload;
  boolean: boolean;
  errors: Array<IBaseError>;
}
