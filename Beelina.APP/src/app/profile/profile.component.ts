import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { UserAccountInformationResult } from '../_models/results/user-account-information-result';
import { UserModulePermission } from '../_models/user-module-permission';
import { User } from '../_models/user.model';
import { AuthService } from '../_services/auth.service';
import { UniqueUsernameValidator } from '../_validators/unique-username.validator';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { DialogService } from '../shared/ui/dialog/dialog.service';
import { NotificationService } from '../shared/ui/notification/notification.service';
import { UserAccountService } from '../_services/user-account.service';
import { ButtonOptions } from '../_enum/button-options.enum';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent extends BaseComponent {
  private _profileForm: FormGroup;
  private _userDetails: User;

  private authService = inject(AuthService);
  private userAccountService = inject(UserAccountService);
  private formBuilder = inject(FormBuilder);
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslateService);
  private uniqueUsernameValidator = inject(UniqueUsernameValidator);

  constructor() {
    super();

    this._profileForm = this.formBuilder.group(
      {
        firstName: ['', Validators.required],
        middleName: [''],
        lastName: ['', Validators.required],
        emailAddress: ['', [Validators.required, Validators.email]],
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
      },
      {
        updateOn: 'blur',
      }
    );

    const userId = this.authService.userId;
    this.uniqueUsernameValidator.userId = userId;

    this.userAccountService
      .getUserAccount(userId)
      .subscribe((data: UserAccountInformationResult) => {
        this._userDetails = data;
        this._profileForm.get('firstName').setValue(data.firstName);
        this._profileForm.get('middleName').setValue(data.middleName);
        this._profileForm.get('lastName').setValue(data.lastName);
        this._profileForm.get('emailAddress').setValue(data.emailAddress);
        this._profileForm.get('username').setValue(data.username);
      });
  }

  profileHasChanged(): boolean {
    return (
      this._profileForm.get('firstName').value !==
      this._userDetails.firstName ||
      this._profileForm.get('middleName').value !==
      this._userDetails.middleName ||
      this._profileForm.get('lastName').value !== this._userDetails.lastName ||
      this._profileForm.get('emailAddress').value !==
      this._userDetails.emailAddress ||
      this._profileForm.get('username').value !== this._userDetails.username ||
      this._profileForm.get('newPassword').value !== ''
    );
  }

  saveProfile() {
    this._profileForm.markAllAsTouched();

    if (this._profileForm.valid && this.profileHasChanged()) {
      const user = new User();
      user.id = this.authService.userId;
      user.firstName = this._profileForm.get('firstName').value;
      user.middleName = this._profileForm.get('middleName').value;
      user.lastName = this._profileForm.get('lastName').value;
      user.emailAddress = this._profileForm.get('emailAddress').value;
      user.username = this._profileForm.get('username').value;
      user.password = this._profileForm.get('newPassword').value;
      user.salesAgentType = this._userDetails.salesAgentType;

      user.userPermissions = this._userDetails.userPermissions.map((p) => {
        return <UserModulePermission>{
          id: p.id,
          moduleId: p.moduleId,
          permissionLevel: p.permissionLevel,
        };
      });

      this.dialogService
        .openConfirmation(
          this.translateService.instant(
            'PROFILE_PAGE.EDIT_PROFILE_DIALOG.TITLE'
          ),
          this.translateService.instant(
            'PROFILE_PAGE.EDIT_PROFILE_DIALOG.CONFIRM'
          )
        )
        .subscribe((result: ButtonOptions) => {
          if (result == ButtonOptions.YES) {
            this._isLoading = true;
            this.userAccountService.updateAccountInformation(user).subscribe({
              next: () => {
                this._isLoading = false;
                this._userDetails = user;
                this.notificationService.openSuccessNotification(this.translateService.instant(
                  'PROFILE_PAGE.EDIT_PROFILE_DIALOG.SUCCESS_MESSAGE'
                ));
                this.authService.refresh().subscribe(); // Make sure to refresh user details
              },
              error: (error) => {
                this._isLoading = false;
                this.notificationService.openErrorNotification(this.translateService.instant(
                  'PROFILE_PAGE.EDIT_PROFILE_DIALOG.ERROR_MESSAGE'
                ));
              },
            });
          }
        });
    }
  }

  get profileForm(): FormGroup {
    return this._profileForm;
  }
}
