import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UIService {
  private _sideNavRef: MatSidenav | undefined;
  private _isHandSet: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver) {
    this._isHandSet;
  }
  setDrawerRef(sideNavRef: MatSidenav | undefined): void {
    this._sideNavRef = sideNavRef;
  }

  toggleDrawer(isOpen: boolean = true): void {
    this._sideNavRef?.toggle(isOpen);
  }

  get isHandset(): Observable<boolean> {
    return this._isHandSet;
  }
}
