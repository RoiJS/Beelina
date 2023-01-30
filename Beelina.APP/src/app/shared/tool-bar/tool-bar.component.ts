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

  private _isHandset = false;

  private isHandSetSubscription: Subscription | undefined;

  constructor(private uiService: UIService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.isHandSetSubscription) {
      this.isHandSetSubscription?.unsubscribe();
    }
  }

  toggleDrawer(): void {
    this.uiService.toggleDrawer();
  }

  ngAfterContentChecked() {
    this.isHandSetSubscription = this.uiService.isHandset.subscribe(
      (result: boolean) => {
        this._isHandset = result;
      }
    );
  }

  get isHandset(): boolean {
    return this._isHandset;
  }
}
