import { LoginAuthCredentialsStateInterface } from '../auth/types/login-state.interface';

export interface AppStateInterface {
  authCredentials: LoginAuthCredentialsStateInterface;
}
