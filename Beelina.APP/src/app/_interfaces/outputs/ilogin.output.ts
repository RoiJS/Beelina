import { IBaseError } from '../errors/ibase.error';
import { ILoginPayload } from '../payloads/ilogin.payload';

export interface ILoginOutput {
  loginPayLoad: ILoginPayload;
  errors: Array<IBaseError>;
}
