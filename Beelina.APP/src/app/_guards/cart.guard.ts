import { Injectable } from '@angular/core';
import {
  CanLoad,
  Route,
  UrlSegment,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { select, Store } from '@ngrx/store';

import { Observable, of, switchMap } from 'rxjs';
import { productTransactionsSelector } from '../product/add-to-cart-product/store/selectors';
import { AppStateInterface } from '../_interfaces/app-state.interface';

@Injectable()
export class CartGuard implements CanLoad, CanActivate {
  constructor(private store: Store<AppStateInterface>) {}

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.store.pipe(
      select(productTransactionsSelector),
      switchMap((p) => of(p.length > 0))
    );
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.store.pipe(
      select(productTransactionsSelector),
      switchMap((p) => of(p.length > 0))
    );
  }
}
