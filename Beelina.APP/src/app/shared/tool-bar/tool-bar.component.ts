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
  implements OnInit, OnDestroy, AfterContentChecked {
  @Input() title = '';
  @Input() showBackButton = true;
  @Input() overrideBackAction = false;
  @Output() onGoBackOverride = new EventEmitter<void>();

  private _isHandset = false;

  private isHandSetSubscription: Subscription | undefined;
  private _company: string;
  private _subscription: Subscription = new Subscription();

  isAdmin: boolean;

  constructor(
    private authService: AuthService,
    private uiService: UIService,
    private location: Location) {
    super();
    this._currentLoggedInUser = this.authService.user.value;
    this.isAdmin = this.modulePrivilege(ModuleEnum.Retail) === this.getPermissionLevel(PermissionLevelEnum.Administrator);
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    if (this.isHandSetSubscription) {
      this.isHandSetSubscription?.unsubscribe();
    }

    if (this._subscription) {
      this._subscription.unsubscribe();
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
    this._subscription.add(this.uiService.isHandset.subscribe(
      (result: boolean) => {
        this._isHandset = result;
      }
    ));

    this._subscription.add(this.authService.company.subscribe((company: string) => {
      this._company = company;
    }));
  }

  get canGoBack() {
    return this.showBackButton;
  }

  get isHandset(): boolean {
    return this._isHandset;
  }

  get company(): string {
    return this._company;
  }
}
