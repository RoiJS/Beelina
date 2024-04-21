import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { UniqueUsernameValidator } from 'src/app/_validators/unique-username.validator';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { isLoadingSelector } from '../store/selectors';
import { UserAccountService } from 'src/app/_services/user-account.service';
import { User } from 'src/app/_models/user.model';
import { UserAccountInformationResult } from 'src/app/_models/results/user-account-information-result';
import { ModuleEnum } from 'src/app/_enum/module.enum';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { UserModulePermission } from 'src/app/_models/user-module-permission';

@Component({
  selector: 'app-manage-user-account-details',
  templateUrl: './manage-user-account-details.component.html',
  styleUrls: ['./manage-user-account-details.component.scss']
})
export class ManageUserAccountDetailsComponent extends BaseComponent implements OnInit {
  private _accountId: number;
  private _profileForm: FormGroup;
  private _title: string;
  private _userDetails: User = new User();
  private _personalInformationLabelText: string;
  private _accountInformationLabelText: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private router: Router,
    private store: Store<AppStateInterface>,
    private translateService: TranslateService,
    private uniqueUsernameValidator: UniqueUsernameValidator,
    private userAccountService: UserAccountService,
  ) {
    super();

    this.$isLoading = this.store.pipe(select(isLoadingSelector));
    this._personalInformationLabelText = this.translateService.instant('MANAGE_ACCOUNT_PAGE.TAB_SECTIONS.PERSONAL_INFORMATION');
    this._accountInformationLabelText = this.translateService.instant('MANAGE_ACCOUNT_PAGE.TAB_SECTIONS.ACCOUNT_INFORMATION');

    this._profileForm = this.formBuilder.group(
      {
        firstName: ['', Validators.required],
        middleName: [''],
        lastName: ['', Validators.required],
        emailAddress: ['', [Validators.required, Validators.email]],
        permission: [null, Validators.required],
        username: [
          '',
          [Validators.required],
          [
            this.uniqueUsernameValidator.validate.bind(
              this.uniqueUsernameValidator
            ),
          ],
        ],
        newPassword: [
          '',
          [
            Validators.pattern(
              '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$'
            ),
          ],
        ],
        confirmPassword: [
          '',
          [
            Validators.pattern(
              '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$'
            ),
          ],
        ],
      },
      {
        updateOn: 'blur',
        validators: this.passwordMatchValidator()
      }
    );
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const password = control.get('newPassword');
      const confirmPassword = control.get('confirmPassword');

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ 'passwordMismatch': true });
      } else {
        confirmPassword.setErrors(null);
      }

      return null;
    };
  }

  ngOnInit() {
    this._accountId = +this.activatedRoute.snapshot.paramMap.get('id');
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
        });
    }
  }

  saveInfo() {
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
        .subscribe((result: boolean) => {
          if (result) {
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
}
