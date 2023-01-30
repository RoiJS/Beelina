import { ILoginAuthCredentialsInterface } from './login-auth-credentials.interface';

export interface LoginAuthCredentialsStateInterface {
  isLoading: boolean;
  authCredentials: ILoginAuthCredentialsInterface;
  error: string;
}
