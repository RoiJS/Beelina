import { createAction, props } from '@ngrx/store';
import { ILoginAuthCredentialsInterface } from '../types/login-auth-credentials.interface';

export const loginAction = createAction(
  '[Auth] Login',
  props<{ username: string; password: string }>()
);

export const getLoginSuccess = createAction(
  '[Auth] Login Success',
  props<{ authTokenCredentials: ILoginAuthCredentialsInterface }>()
);

export const getLoginError = createAction(
  '[Auth] Login Failed',
  props<{ error: string }>()
);
