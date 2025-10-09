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

  private _isMobile: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  private _isTablet: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.TabletPortrait, Breakpoints.TabletLandscape])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver) {
    this._isHandSet;
    this._isMobile;
    this._isTablet;
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

  get isMobile(): Observable<boolean> {
    return this._isMobile;
  }

  get isTablet(): Observable<boolean> {
    return this._isTablet;
  }
}
