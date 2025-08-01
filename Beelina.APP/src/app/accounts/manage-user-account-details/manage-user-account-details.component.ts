import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { UserAccountInformationResult } from 'src/app/_models/results/user-account-information-result';
import { UserModulePermission } from 'src/app/_models/user-module-permission';
import { User } from 'src/app/_models/user.model';
import { UniqueUsernameValidator } from 'src/app/_validators/unique-username.validator';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { isLoadingSelector, totalCountSelector } from '../store/selectors';

import { LogLevelEnum } from 'src/app/_enum/log-type.enum';
import { ModuleEnum } from 'src/app/_enum/module.enum';
import { SalesAgentTypeEnum } from 'src/app/_enum/sales-agent-type.enum';
import { PermissionLevelEnum } from 'src/app/_enum/permission-level.enum';
import { ClientSubscriptionDetails } from 'src/app/_models/client-subscription-details.model';

import { ApplySubscriptionService } from 'src/app/_services/apply-subscription.service';
import { LocalClientSubscriptionDbService } from 'src/app/_services/local-db/local-client-subscription-db.service';
import { LogMessageService } from 'src/app/_services/log-message.service';
import { UserAccountService } from 'src/app/_services/user-account.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { Subscription } from 'rxjs';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { AuthService } from 'src/app/_services/auth.service';
import { BusinessModelEnum } from 'src/app/_enum/business-model.enum';

@Component({
  selector: 'app-manage-user-account-details',
  templateUrl: './manage-user-account-details.component.html',
  styleUrls: ['./manage-user-account-details.component.scss']
})
export class ManageUserAccountDetailsComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
  private _accountId: number;
  private _profileForm: FormGroup;
  private _title: string;
  private _userDetails: User = new User();
  private _personalInformationLabelText: string;
  private _accountInformationLabelText: string;
  private _totalUserAccountCount = signal<number>(0);
  private _subscription: Subscription = new Subscription();

  businessModel: BusinessModelEnum;
  clientSubscriptionDetails: ClientSubscriptionDetails;

  authService = inject(AuthService);
  activatedRoute = inject(ActivatedRoute);
  applySubscriptionService = inject(ApplySubscriptionService);
  bottomSheet = inject(MatBottomSheet);
  dialogService = inject(DialogService);
  formBuilder = inject(FormBuilder);
  loggerService = inject(LogMessageService);
  localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  store = inject(Store<AppStateInterface>);
  translateService = inject(TranslateService);
  uniqueUsernameValidator = inject(UniqueUsernameValidator);
  userAccountService = inject(UserAccountService);

  constructor() {
    super();

    this.$isLoading = this.store.pipe(select(isLoadingSelector));
    this._personalInformationLabelText = this.translateService.instant('MANAGE_ACCOUNT_PAGE.TAB_SECTIONS.PERSONAL_INFORMATION');
    this._accountInformationLabelText = this.translateService.instant('MANAGE_ACCOUNT_PAGE.TAB_SECTIONS.ACCOUNT_INFORMATION');
    this.applySubscriptionService.setBottomSheet(this.bottomSheet);
    this.businessModel = this.authService.businessModel;

    this._profileForm = this.formBuilder.group(
      {
        firstName: ['', Validators.required],
        middleName: [''],
        lastName: ['', Validators.required],
        emailAddress: ['', [Validators.required, Validators.email]],
        permission: [null, Validators.required],
        salesAgentType: [SalesAgentTypeEnum.None],
        username: [
          '',
          [Validators.required],
          [
            this.uniqueUsernameValidator.validate.bind(
              this.uniqueUsernameValidator
            ),
          ],
        ],
        newPassword: [''],
        confirmPassword: [''],
      },
      {
        updateOn: 'blur',
        validators: [this.passwordPatternInvalid(), this.passwordMatchValidator()]
      }
    );

    this._profileForm.get('permission')?.valueChanges.subscribe((value) => {
      if (value === PermissionLevelEnum.User) {
        this._profileForm.get('salesAgentType')?.setValue(SalesAgentTypeEnum.FieldAgent);
      } else {
        this._profileForm.get('salesAgentType')?.setValue(SalesAgentTypeEnum.None);
      }
    });
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const password = control.get('newPassword');
      const confirmPassword = control.get('confirmPassword');

      if (this._accountId > 0 && password.value.length === 0 && confirmPassword.value.length === 0) {
        password.setErrors(null);
        confirmPassword.setErrors(null);
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ ...confirmPassword.errors, 'passwordMismatch': true });
      } else {
        confirmPassword.setErrors(confirmPassword.errors || null);
      }

      return null;
    };
  }

  passwordPatternInvalid(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const pattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      const newPassword = control.get('newPassword');
      const confirmPassword = control.get('confirmPassword');

      if (this._accountId > 0 && newPassword.value.length === 0 && confirmPassword.value.length === 0) {
        newPassword.setErrors(null);
        confirmPassword.setErrors(null);
        return null;
      }

      if (!pattern.test(newPassword.value)) {
        newPassword.setErrors({ ...newPassword.errors, 'pattern': true });
      } else {
        newPassword.setErrors(newPassword.errors || null);
      }

      if (!pattern.test(confirmPassword.value)) {
        confirmPassword.setErrors({ ...confirmPassword.errors, 'pattern': true });
      } else {
        confirmPassword.setErrors(confirmPassword.errors || null);
      }

      return null;
    };
  }

  async ngOnInit() {
    this._accountId = +this.activatedRoute.snapshot.paramMap.get('id');
    this.clientSubscriptionDetails = await this.localClientSubscriptionDbService.getLocalClientSubsription();

    if (this._accountId === 0) {
      this._title = this.translateService.instant('MANAGE_ACCOUNT_PAGE.FORM_CONTROL_SECTION.TITLE.CREATE_NEW');
      this._profileForm.get('newPassword')?.setValidators(Validators.required);
      this._profileForm.get('confirmPassword')?.setValidators(Validators.required);
    } else {
      this._title = this.translateService.instant('MANAGE_ACCOUNT_PAGE.FORM_CONTROL_SECTION.TITLE.UPDATE_EXISTING');
      this.uniqueUsernameValidator.userId = this._accountId;

      this.userAccountService
        .getUserAccount(this._accountId)
        .subscribe((user: UserAccountInformationResult) => {
          this._userDetails = user;
          this._profileForm.get('firstName').setValue(user.firstName);
          this._profileForm.get('middleName').setValue(user.middleName);
          this._profileForm.get('lastName').setValue(user.lastName);
          this._profileForm.get('emailAddress').setValue(user.emailAddress);
          this._profileForm.get('username').setValue(user.username);
          this._profileForm.get('permission').setValue(user.getModulePrivilege(ModuleEnum.Distribution).key);
          this._profileForm.get('salesAgentType').setValue(user.salesAgentType);
        });
    }
  }

  ngAfterViewInit() {
    this._subscription.add(
      this.store.pipe(select(totalCountSelector))
        .subscribe((totalCount: number) => {
          this._totalUserAccountCount.set(totalCount);
        })
    );
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  saveInfo() {

    if (this._totalUserAccountCount() >= this.clientSubscriptionDetails.userAccountsMax &&
      this.clientSubscriptionDetails.allowExceedUserAccountsMax) {

      // Check for new user accounts only.
      if (this._accountId === 0) {
        this.notificationService.openWarningNotification(this.translateService.instant('SUBSCRIPTION_TEXTS.USER_REGISTRATION_EXCEEDS_LIMIT_WARNING'));
      }
    }

    try {

      this._profileForm.markAllAsTouched();

      if (this._profileForm.valid) {
        const user = new User();
        user.id = this._accountId;
        user.firstName = this._profileForm.get('firstName').value;
        user.middleName = this._profileForm.get('middleName').value;
        user.lastName = this._profileForm.get('lastName').value;
        user.emailAddress = this._profileForm.get('emailAddress').value;
        user.username = this._profileForm.get('username').value;
        user.password = this._profileForm.get('newPassword').value;
        user.salesAgentType = this._profileForm.get('permission').value === PermissionLevelEnum.User ? this._profileForm.get('salesAgentType').value : SalesAgentTypeEnum.None;

        if (this._accountId > 0)
          user.userPermissions = this._userDetails.userPermissions.map((p) => {
            if (p.moduleId === ModuleEnum.Distribution)
              p.permissionLevel = this._profileForm.get('permission').value;
            return <UserModulePermission>{
              id: p.id,
              moduleId: p.moduleId,
              permissionLevel: p.permissionLevel,
            };
          });
        else
          user.userPermissions.push(
            <UserModulePermission>{
              id: 0,
              moduleId: ModuleEnum.Distribution,
              permissionLevel: this._profileForm.get('permission').value
            }
          );

        let title = "", message = "", successMessage = "", errorMessage = "";
        if (this._accountId > 0) {
          title = this.translateService.instant('MANAGE_ACCOUNT_PAGE.EDIT_ACCOUNT_DIALOG.TITLE');
          message = this.translateService.instant('MANAGE_ACCOUNT_PAGE.EDIT_ACCOUNT_DIALOG.CONFIRM');
          successMessage = this.translateService.instant('MANAGE_ACCOUNT_PAGE.EDIT_ACCOUNT_DIALOG.SUCCESS_MESSAGE');
          errorMessage = this.translateService.instant('MANAGE_ACCOUNT_PAGE.EDIT_ACCOUNT_DIALOG.ERROR_MESSAGE');
        } else {
          title = this.translateService.instant('MANAGE_ACCOUNT_PAGE.NEW_ACCOUNT_DIALOG.TITLE');
          message = this.translateService.instant('MANAGE_ACCOUNT_PAGE.NEW_ACCOUNT_DIALOG.CONFIRM');
          successMessage = this.translateService.instant('MANAGE_ACCOUNT_PAGE.NEW_ACCOUNT_DIALOG.SUCCESS_MESSAGE');
          errorMessage = this.translateService.instant('MANAGE_ACCOUNT_PAGE.NEW_ACCOUNT_DIALOG.ERROR_MESSAGE');
        }

        this.dialogService
          .openConfirmation(title, message)
          .subscribe((result: ButtonOptions) => {
            if (result === ButtonOptions.YES) {
              this._isLoading = true;
              this.userAccountService.updateAccountInformation(user).subscribe({
                next: () => {
                  this._isLoading = false;
                  this._userDetails = user;
                  this.notificationService.openSuccessNotification(this.translateService.instant(successMessage));
                  this.router.navigate(['/accounts']);
                },
                error: (error) => {
                  this._isLoading = false;
                  this.notificationService.openErrorNotification(this.translateService.instant(errorMessage));
                },
              });
            }
          });
      } else {
        this.notificationService.openErrorNotification(this.translateService.instant('MANAGE_ACCOUNT_PAGE.INVALID_FORM_DIALOG.TITLE'));
      }
    } catch (ex) {
      console.error(ex);
      this.loggerService.logMessage(LogLevelEnum.ERROR, ex);
    }
  }

  get profileForm(): FormGroup {
    return this._profileForm;
  }

  get title(): string {
    return this._title;
  }

  get accountInformationLabelText(): string {
    return this._accountInformationLabelText;
  }

  get personalInformationLabelText(): string {
    return this._personalInformationLabelText;
  }

  get businessModelHybridMonitoring(): boolean {
    return this.businessModel === BusinessModelEnum.WarehousePanelHybridMonitoring;
  }
}
