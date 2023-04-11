import { createReducer, on } from '@ngrx/store';

import { ILoginAuthCredentialsState } from '../types/login-state.interface';
import * as LoginActions from './actions';

export const initialState: ILoginAuthCredentialsState = {
  isLoading: false,
  isUpdateLoading: false,
  authCredentials: {
    accessToken: null,
    refreshToken: null,
    expiresIn: null,
  },
  error: null,
};

export const reducers = createReducer(
  initialState,
  on(LoginActions.loginAction, (state, action) => ({
    ...state,
    isLoading: true,
  })),
  on(LoginActions.getLoginSuccess, (state, action) => ({
    ...state,
    isLoading: false,
    authCredentials: action.authTokenCredentials,
  })),
  on(LoginActions.getLoginError, (state, action) => ({
    ...state,
    error: action.error,
  })),
  on(LoginActions.reserLoginCredentials, (state, action) => ({
    ...state,
    isLoading: false,
    isUpdateLoading: false,
    authCredentials: {
      accessToken: null,
      refreshToken: null,
      expiresIn: null,
    },
    error: null,
  }))
);
