import { inject, Injectable } from '@angular/core';
import {
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { Observable } from 'rxjs';
import { SidedrawerService } from '../_services/sidedrawer.service';
import { AuthService } from '../_services/auth.service';

@Injectable()
export class AccessGuard {

  private authService = inject(AuthService);
  private sidedrawerService = inject(SidedrawerService);

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const currentMainUrl = state.url;
    const mainUrls = this.sidedrawerService.getMenus();
    const exists = mainUrls.find((u) => currentMainUrl.includes(u.url));
    if (!exists) {
      this.authService.logout();
    }
    return Boolean(exists);
  }
}
