import { IBaseState } from 'src/app/payment-methods/types/payment-method-state.interface';
import { ILoginAuthCredentials } from './login-auth-credentials.interface';

export interface ILoginAuthCredentialsState extends IBaseState {
  authCredentials: ILoginAuthCredentials;
}
