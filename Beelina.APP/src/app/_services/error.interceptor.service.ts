import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpErrorResponse,
  HTTP_INTERCEPTORS,
  HttpHandler,
  HttpRequest,
  HttpEvent,
} from '@angular/common/http';
import { catchError, switchMap, take, tap } from 'rxjs/operators';
import { throwError, Observable, of, from } from 'rxjs';

import { AuthService } from './auth.service';
import { AuthToken } from '../_models/auth-token.model';

@Injectable()
export class ErrorInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((exception) => {
        // If the error status is Unauthorized and
        // Header request contains Token-Expired,
        // we will send request to refresh the token
        // attempt to resend the request.
        if (
          exception.status === 401 &&
          exception.headers.has('Token-Expired')
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

        let serverError = null;
        let modelStateErrors = '';
        if (exception instanceof HttpErrorResponse) {
          const applicationError = exception.headers.get('Application-Error');
          if (applicationError) {
            return throwError(applicationError);
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

        return throwError(modelStateErrors || serverError || 'Server Error');
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
