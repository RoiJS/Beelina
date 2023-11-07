import { IBaseError } from '../errors/ibase.error';
import { IUserAccountPayload } from '../payloads/iuser-account.payload';

export interface IUpdateAccountOutput {
  userAccount: IUserAccountPayload;
  errors: Array<IBaseError>;
}
