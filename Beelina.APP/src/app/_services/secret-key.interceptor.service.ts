import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { StorageService } from './storage.service';
import { ForgotPasswordService } from './forgot-password.service';

import { AuthToken } from '../_models/auth-token.model';

@Injectable({
  providedIn: 'root',
})
export class SecretKeyInterceptorService implements HttpInterceptor {
  constructor(
    private forgotPasswordService: ForgotPasswordService,
    private storageService: StorageService
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let appSecretToken = '';
    let headers = {};

    if (this.forgotPasswordService.appSecretToken.getValue()) {
      appSecretToken = this.forgotPasswordService.appSecretToken.getValue();
    }

    if (this.storageService.hasKey('appSecretToken')) {
      appSecretToken = this.storageService.getString('appSecretToken');
    }

    // Make sure to only add headers for graphql requests
    if (req.url.includes("graphql")) {
      headers = {
        'App-Secret-Token': appSecretToken,
        Authorization: `Bearer ${this.tokenGetter()}`,
        'ngsw-bypass': '' // This is to make sure HTTP requests are cached via the service worker.
      };
    }

    const authReq = req.clone({
      setHeaders: headers,
    });

    return next.handle(authReq);
  }

  tokenGetter() {
    const storedTokenInfo = this.storageService.getString('authToken');

    if (!storedTokenInfo) {
      return '';
    }

    const tokenInfo: {
      _accessToken: string;
      _refresTtoken: string;
      _refreshTokenExpirationDate: Date;
    } = JSON.parse(storedTokenInfo);

    const authToken = new AuthToken(
      tokenInfo._accessToken,
      tokenInfo._refresTtoken,
      new Date(tokenInfo._refreshTokenExpirationDate)
    );

    return authToken.token;
  }
}

export const SecretKeyInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: SecretKeyInterceptorService,
  multi: true,
};
