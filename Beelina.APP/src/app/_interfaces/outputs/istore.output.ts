import { IBaseError } from '../errors/ibase.error';
import { IStorePayload } from '../payloads/istore.payload';

export interface IStoreOutput {
  store: IStorePayload;
  errors: Array<IBaseError>;
}
