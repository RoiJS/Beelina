import { IBaseState } from 'src/app/_interfaces/states/ibase.state';
import { ILoginAuthCredentials } from './login-auth-credentials.interface';

export interface ILoginAuthCredentialsState extends IBaseState {
  authCredentials: ILoginAuthCredentials;
}
