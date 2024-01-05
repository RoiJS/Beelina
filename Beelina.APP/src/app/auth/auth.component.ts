import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { authCredentialsSelector, errorSelector } from './store/selectors';

import * as LoginActions from './store/actions';
import { AppVersionService } from '../_services/app-version.service';
import { AuthService } from '../_services/auth.service';
import { NotificationService } from '../shared/ui/notification/notification.service';
import { StorageService } from '../_services/storage.service';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import { ClientNotExistsError } from '../_models/errors/client-not-exists.error';
import { ClientInformationResult } from '../_models/results/client-information-result.result';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { ModuleEnum } from '../_enum/module.enum';
import {
  getPermissionLevelEnum,
  PermissionLevelEnum,
} from '../_enum/permission-level.enum';

@Component({
  selector: 'app-auth-module',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent extends BaseComponent implements OnInit {
  private _authForm: FormGroup;

  constructor(
    private authService: AuthService,
    private appVersionService: AppVersionService,
    private formBuilder: FormBuilder,
    private router: Router,
    private notificationService: NotificationService,
    private storageService: StorageService,
    private store: Store<AppStateInterface>,
    private translateService: TranslateService
  ) {
    super();
    this._authForm = this.formBuilder.group({
      company: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit() { }

  onSubmit() {
    const company = this.authForm.get('company').value;

    if (this._authForm.valid) {
      this._isLoading = true;
      this.store.dispatch(LoginActions.resetLoginCredentials());

      this.authService.checkCompany(company).subscribe({
        next: (client: ClientInformationResult) => {
          this.authService.company.next(client.name);
          this.storageService.storeString('company', client.name);
          this.storageService.storeString('appSecretToken', client.dBHashName);

          const username = this.authForm.get('username').value;
          const password = this.authForm.get('password').value;

          this.store.dispatch(LoginActions.loginAction({ username, password }));

          this.store.pipe(select(authCredentialsSelector)).subscribe((auth) => {
            if (auth.accessToken) {
              this.router.navigate([this.getDefaultLandingPage()], {
                replaceUrl: true,
              });
            }
          });

          this.store.pipe(select(errorSelector)).subscribe((error) => {
            if (error) {
              this._isLoading = false;
              this.notificationService.openErrorNotification(error);
            }
          });
        },
        error: (e: ClientNotExistsError) => {
          this._isLoading = false;
          this.notificationService.openErrorNotification(e.message);
        },
      });
    }
  }

  // Get default landing page based on user permission.
  // For now, we set default landing page as profile page for Managers and
  // sales page for user account with User or Administrator Permission.
  // We will revisit this later on to make this landing page configurable.
  private getDefaultLandingPage() {
    let defaultLandingPage = '/sales';
    const userPermission = this.authService.user.value.getModulePrivilege(
      ModuleEnum.Retail
    );
    if (userPermission > getPermissionLevelEnum(PermissionLevelEnum.User)) {
      defaultLandingPage = '/product-catalogue';
    }

    return defaultLandingPage;
  }

  get authForm(): FormGroup {
    return this._authForm;
  }

  get copyRightText(): string {
    return this.appVersionService.copyRightText;
  }

  get appVersion(): string {
    return this.appVersionService.appVersion;
  }

  get companyFieldPlaceHolder(): string {
    return this.translateService.instant(
      'AUTH_PAGE.AUTH_FORM.COMPANY_FIELD.HINT'
    );
  }

  get usernameFieldPlaceHolder(): string {
    return this.translateService.instant(
      'AUTH_PAGE.AUTH_FORM.USERNAME_FIELD.HINT'
    );
  }

  get passwordFieldPlaceHolder(): string {
    return this.translateService.instant(
      'AUTH_PAGE.AUTH_FORM.PASSWORD_FIELD.HINT'
    );
  }
}
