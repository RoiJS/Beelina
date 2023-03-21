import { Location } from '@angular/common';
import {
  AfterContentChecked,
  Component,
  Input,
  OnDestroy,
  OnInit,
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
    this.location.back();
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
