import { inject, Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpErrorResponse,
  HTTP_INTERCEPTORS,
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { catchError, switchMap, take } from 'rxjs/operators';
import { throwError, Observable, of } from 'rxjs';

import { AuthService } from './auth.service';
import { AuthToken } from '../_models/auth-token.model';

@Injectable()
export class ErrorInterceptorService implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      switchMap((response: HttpResponse<any>) => {
        const errors = response.body?.errors;
        if (errors && errors.length > 0) {
          const errorCode = errors[0].extensions.code;

          if (errorCode === 'AUTH_NOT_AUTHENTICATED' || errorCode === 'AUTH_NOT_AUTHORIZED') {
            return this.authService.refresh().pipe(
              switchMap(() => {
                return this.updateHeader(req);
              }),
              switchMap((newRequest) => {
                return next.handle(newRequest);
              })
            );
          }
        }
        return of(response);
      }),
      catchError((exception) => {
        // If the error status is Unauthorized and
        // Header request contains Token-Expired,
        // we will send request to refresh the token
        // attempt to resend the request.
        const errors = exception.error.errors;

        if (errors && errors.length > 0) {
          const errorCode = errors[0].extensions.code;

          if (
            exception.status === 500 &&
            (errorCode === 'AUTH_NOT_AUTHENTICATED' || errorCode === 'AUTH_NOT_AUTHORIZED')
          ) {
            return this.authService.refresh().pipe(
              switchMap(() => {
                return this.updateHeader(req);
              }),
              switchMap((newRequest) => {
                return next.handle(newRequest);
              })
            );
          }
        }

        let serverError = null;
        let modelStateErrors = '';
        if (exception instanceof HttpErrorResponse) {
          const applicationError = exception.headers.get('Application-Error');
          if (applicationError) {
            return throwError(() => new Error(applicationError));
          } else {
            serverError = (<any>exception).error;
            if (
              serverError &&
              serverError.errors &&
              typeof serverError.errors === 'object'
            ) {
              for (const key in serverError.errors) {
                if (serverError.errors[key]) {
                  modelStateErrors += serverError.errors[key] + '\n';
                }
              }
            }
          }
        }

        return throwError(
          () => new Error(modelStateErrors || serverError || 'Server Error')
        );
      })
    );
  }

  updateHeader(req: HttpRequest<any>): Observable<HttpRequest<any>> {
    return this.authService.authToken.pipe(
      take(1),
      switchMap((t: AuthToken) => {
        req = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${t.token}`),
        });

        return of(req);
      })
    );
  }
}

export const ErrorInteceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ErrorInterceptorService,
  multi: true,
};
