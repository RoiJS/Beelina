import { inject, Injectable } from '@angular/core';
import {
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { Observable } from 'rxjs';

import { AuthService } from '../_services/auth.service';

@Injectable()
export class AdminGuard {

  private authService = inject(AuthService);

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.checkAdministratorAcces();
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.checkAdministratorAcces();
  }
}
