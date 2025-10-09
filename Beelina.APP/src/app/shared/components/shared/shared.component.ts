import {
  AfterContentChecked,
  AfterViewChecked,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { UIService } from 'src/app/_services/ui.service';

import { BaseComponent } from '../base-component/base.component';

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
})
export class SharedComponent
  extends BaseComponent
  implements OnInit, OnDestroy, AfterViewChecked, AfterContentChecked {
  protected _isHandset = false;
  protected _isMobile = false;
  protected _isTablet = false;
  protected _fragment: string | null = '';

  protected isHandSetSubscription: Subscription | undefined;
  protected fragmentSubscription: Subscription | undefined;

  protected activatedRoute: ActivatedRoute | null = null;

  protected subscription = new Subscription();

  constructor(protected uiService: UIService) {
    super();
    this._fragment = '';
  }

  ngOnInit(): void {
    this.fragmentSubscription = this.activatedRoute?.fragment.subscribe(
      (fragment: string | null) => {
        this._fragment = fragment;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.isHandSetSubscription) {
      this.isHandSetSubscription?.unsubscribe();
    }

    if (this.fragmentSubscription) {
      this.fragmentSubscription?.unsubscribe();
    }

    this.subscription.unsubscribe();
  }

  ngAfterContentChecked() {
    this.subscription.add(this.uiService.isHandset.subscribe(
      (result: boolean) => {
        this._isHandset = result;
      }
    ));

    this.subscription.add(this.uiService.isMobile.subscribe(
      (result: boolean) => {
        this._isMobile = result;
      }
    ));

    this.subscription.add(this.uiService.isTablet.subscribe(
      (result: boolean) => {
        this._isTablet = result;
      }
    ));
  }

  ngAfterViewChecked(): void {
    try {
      document.querySelector('#' + this._fragment)?.scrollIntoView();
    } catch (e) { }
  }

  get isHandset(): boolean {
    return this._isHandset;
  }

  get isMobile(): boolean {
    return this._isMobile;
  }

  get isTablet(): boolean {
    return this._isTablet;
  }
}
