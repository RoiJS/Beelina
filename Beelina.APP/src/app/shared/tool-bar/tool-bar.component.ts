import { Location } from '@angular/common';
import {
  AfterContentChecked,
  Component, inject,
  input, OnDestroy, output
} from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from 'src/app/_services/auth.service';
import { UIService } from 'src/app/_services/ui.service';
import { BaseComponent } from '../components/base-component/base.component';
import { ModuleEnum } from 'src/app/_enum/module.enum';
import { PermissionLevelEnum } from 'src/app/_enum/permission-level.enum';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss'],
})
export class ToolBarComponent
  extends BaseComponent
  implements OnDestroy, AfterContentChecked {
  title = input<string>('');
  showBackButton = input<boolean>(true);
  overrideBackAction = input<boolean>(false);
  onGoBackOverride = output<void>();

  private _isHandset = false;

  private isHandSetSubscription: Subscription | undefined;
  private _company: string;
  private _subscription: Subscription = new Subscription();

  private authService = inject(AuthService);
  private uiService = inject(UIService);
  private location = inject(Location);

  isAdmin: boolean;

  constructor() {
    super();
    this._currentLoggedInUser = this.authService.user.value;
    this.isAdmin = this.modulePrivilege(ModuleEnum.Distribution) === this.getPermissionLevel(PermissionLevelEnum.Administrator);
  }

  ngOnDestroy(): void {
    if (this.isHandSetSubscription) {
      this.isHandSetSubscription?.unsubscribe();
    }

    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  ngAfterContentChecked() {
    this._subscription.add(this.uiService.isHandset.subscribe(
      (result: boolean) => {
        this._isHandset = result;
      }
    ));

    this._subscription.add(this.authService.company.subscribe((company: string) => {
      this._company = company;
    }));
  }

  toggleDrawer(): void {
    this.uiService.toggleDrawer();
  }

  onGoBack() {
    if (this.overrideBackAction()) {
      this.onGoBackOverride.emit();
    } else {
      this.location.back();
    }
  }

  get canGoBack() {
    return this.showBackButton();
  }

  get isHandset(): boolean {
    return this._isHandset;
  }

  get company(): string {
    return this.isAdmin ? `${this._company} - ` : '';
  }

  get formattedTitle(): string {
    return `${this.title()}`;
  }
}
