import {
  AfterContentChecked,
  AfterViewChecked,
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { UIService } from 'src/app/_services/ui.service';

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
})
export class SharedComponent
  implements OnInit, OnDestroy, AfterViewChecked, AfterContentChecked
{
  protected _isHandset = false;
  protected _fragment: string | null = '';

  protected isHandSetSubscription: Subscription | undefined;
  protected fragmentSubscription: Subscription | undefined;

  protected activatedRoute: ActivatedRoute | null = null;

  constructor(protected uiService: UIService) {
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
  }

  ngAfterContentChecked() {
    this.isHandSetSubscription = this.uiService.isHandset.subscribe(
      (result: boolean) => {
        this._isHandset = result;
      }
    );
  }

  ngAfterViewChecked(): void {
    try {
      document.querySelector('#' + this._fragment)?.scrollIntoView();
      // window.location.hash = '';
    } catch (e) {}
  }

  get isHandset(): boolean {
    return this._isHandset;
  }
}
