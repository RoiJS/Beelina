import { createAction, props } from '@ngrx/store';
import { ILoginAuthCredentials } from '../types/login-auth-credentials.interface';

export const loginAction = createAction(
  '[Auth] Login',
  props<{ username: string; password: string }>()
);

export const getLoginSuccess = createAction(
  '[Auth] Login Success',
  props<{ authTokenCredentials: ILoginAuthCredentials }>()
);

export const getLoginError = createAction(
  '[Auth] Login Failed',
  props<{ error: string }>()
);
