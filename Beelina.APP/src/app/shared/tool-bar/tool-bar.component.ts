import { Location } from '@angular/common';
import {
  AfterContentChecked,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { UIService } from 'src/app/_services/ui.service';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss'],
})
export class ToolBarComponent
  implements OnInit, OnDestroy, AfterContentChecked
{
  @Input() title = '';
  @Input() showBackButton = true;
  @Input() overrideBackAction = false;
  @Output() onGoBackOverride = new EventEmitter<void>();

  private _isHandset = false;

  private isHandSetSubscription: Subscription | undefined;

  constructor(private uiService: UIService, private location: Location) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.isHandSetSubscription) {
      this.isHandSetSubscription?.unsubscribe();
    }
  }

  toggleDrawer(): void {
    this.uiService.toggleDrawer();
  }

  onGoBack() {
    if (this.overrideBackAction) {
      this.onGoBackOverride.emit();
    } else {
      this.location.back();
    }
  }

  ngAfterContentChecked() {
    this.isHandSetSubscription = this.uiService.isHandset.subscribe(
      (result: boolean) => {
        this._isHandset = result;
      }
    );
  }

  get canGoBack() {
    return this.showBackButton;
  }

  get isHandset(): boolean {
    return this._isHandset;
  }
}
