import { IBaseError } from '../errors/ibase.error';
import { IAuthenticationPayload } from '../payloads/ilogin.payload';

export interface IAuthenticationOutput {
  authenticationPayLoad: IAuthenticationPayload;
  errors: Array<IBaseError>;
}
