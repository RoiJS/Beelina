import { inject, Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import * as LoginActions from './actions';

import { AuthService } from 'src/app/_services/auth.service';

import { IAuthenticationPayload } from 'src/app/_interfaces/payloads/ilogin.payload';

import { ILoginAuthCredentials } from '../types/login-auth-credentials.interface';

@Injectable()
export class LoginEffects {

  private actions$ = inject(Actions);
  private authService = inject(AuthService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.loginAction),
      switchMap((action: { username: string; password: string }) => {
        return this.authService.login(action.username, action.password).pipe(
          map((data: IAuthenticationPayload) => {
            const authTokenCredentials: ILoginAuthCredentials = {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              expiresIn: data.expiresIn,
            };
            this.authService.handleLogin(
              data.accessToken,
              data.refreshToken,
              data.expiresIn
            );
            return LoginActions.getLoginSuccess({ authTokenCredentials });
          }),
          catchError((error) =>
            of(LoginActions.getLoginError({ error: error.message }))
          )
        );
      })
    )
  );
}
