import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, switchMap } from 'rxjs';

import { authCredentialsSelector, errorSelector } from './store/selectors';

import { AppVersionService } from '../_services/app-version.service';
import { AuthService } from '../_services/auth.service';
import { NetworkService } from '../_services/network.service';
import { StorageService } from '../_services/storage.service';
import { SubscriptionService } from '../_services/subscription.service';
import { UIService } from '../_services/ui.service';
import { UserAccountService } from '../_services/user-account.service';
import { NotificationService } from '../shared/ui/notification/notification.service';
import * as LoginActions from './store/actions';

import { ModuleEnum } from '../_enum/module.enum';
import {
  getPermissionLevelEnum,
  PermissionLevelEnum,
} from '../_enum/permission-level.enum';
import { AppStateInterface } from '../_interfaces/app-state.interface';
import { ClientNotExistsError } from '../_models/errors/client-not-exists.error';
import { ClientInformationResult } from '../_models/results/client-information-result.result';
import { SharedComponent } from '../shared/components/shared/shared.component';

@Component({
  selector: 'app-auth-module',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent extends SharedComponent implements OnInit, OnDestroy {
  private _authForm: FormGroup;

  authService = inject(AuthService);
  appVersionService = inject(AppVersionService);
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  networkService = inject(NetworkService);
  notificationService = inject(NotificationService);
  storageService = inject(StorageService);
  store = inject(Store<AppStateInterface>);
  subscriptionService = inject(SubscriptionService);
  translateService = inject(TranslateService);
  userAccountService = inject(UserAccountService);
  loginSubscription = new Subscription();

  constructor(protected override uiService: UIService) {
    super(uiService);
    this._authForm = this.formBuilder.group({
      company: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  override ngOnDestroy() {
    this.loginSubscription.unsubscribe();
  }

  onSubmit() {
    if (!this.networkService.isOnline.value) {
      this.notificationService.openErrorNotification(
        this.translateService.instant("AUTH_PAGE.ERROR_MESSAGES.NO_NETWORK")
      );
      return;
    }

    const company = this.authForm.get('company').value;

    if (this._authForm.valid) {
      this._isLoading = true;
      this.store.dispatch(LoginActions.resetLoginCredentials());
      this.authService.checkCompany(company).subscribe({
        next: (client: ClientInformationResult) => {
          this.authService.company.next(client.name);
          this.storageService.storeString('company', client.name);
          this.storageService.storeString('appSecretToken', client.dbHashName);

          const username = this.authForm.get('username').value;
          const password = this.authForm.get('password').value;

          this.loginSubscription.add(this.store.dispatch(LoginActions.loginAction({ username, password })));

          this.loginSubscription.add(this.store.pipe(select(authCredentialsSelector)).subscribe((auth) => {
            if (auth.accessToken) {
              this.userAccountService
                .getUserSetting(this.authService.userId).pipe(
                  switchMap(() => this.subscriptionService.getClientSubscription(
                    this.storageService.getString('appSecretToken')
                  ))
                ).subscribe(() => {
                  this.router.navigate([this.getDefaultLandingPage()], {
                    replaceUrl: true,
                  });
                });
            }
          }));

          this.loginSubscription.add(this.store.pipe(select(errorSelector)).subscribe((error) => {
            if (error) {
              this._isLoading = false;
              this.notificationService.openErrorNotification(error);
            }
          }));
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
      ModuleEnum.Distribution
    ).value;

    if (userPermission === getPermissionLevelEnum(PermissionLevelEnum.Manager)) {
      defaultLandingPage = '/product-catalogue';
    }

    if (userPermission === getPermissionLevelEnum(PermissionLevelEnum.Administrator)) {
      defaultLandingPage = '/dashboard';
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
