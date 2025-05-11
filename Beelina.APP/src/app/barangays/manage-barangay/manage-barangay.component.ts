import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { Barangay } from 'src/app/_models/barangay';
import { BarangayService } from 'src/app/_services/barangay.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { LocalCustomerAccountsDbService } from 'src/app/_services/local-db/local-customer-accounts-db.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';

@Component({
  selector: 'app-manage-barangay',
  templateUrl: './manage-barangay.component.html',
  styleUrls: ['./manage-barangay.component.scss'],
})
export class ManageBarangayComponent {
  private _barangayForm: FormGroup;
  private _dialogTitle: string;
  private _dialogConfirmationMessage: string;
  private _dialogSuccessMessage: string;
  private _dialogErrorMessage: string;

  private _bottomSheetRef = inject(MatBottomSheetRef<ManageBarangayComponent>);
  private barangayService = inject(BarangayService);
  private dialogService = inject(DialogService);
  private formBuilder = inject(FormBuilder);
  private localCustomerAccountsDbService = inject(LocalCustomerAccountsDbService);
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslateService);

  data = inject<{ barangay: Barangay }>(MAT_BOTTOM_SHEET_DATA);

  constructor() {
    this.setUpLanguageTexts(this.data.barangay.id === 0);
    this._barangayForm = this.formBuilder.group({
      name: [this.data.barangay.name, [Validators.required]],
    });
  }

  onSave() {
    this._barangayForm.markAllAsTouched();

    if (this._barangayForm.valid) {
      const name = this._barangayForm.get('name').value;
      const id = this.data.barangay.id;
      const manageBarangay = new Barangay();
      manageBarangay.name = name;
      manageBarangay.id = id;

      this.dialogService
        .openConfirmation(this.dialogTitle, this._dialogConfirmationMessage)
        .subscribe((result: ButtonOptions) => {
          if (result === ButtonOptions.YES) {
            this.barangayService
              .updateBarangay(manageBarangay)
              .subscribe({
                next: (barangay: Barangay) => {
                  this.localCustomerAccountsDbService.manageLocalCustomerAccount(barangay);
                  this.notificationService.openSuccessNotification(this._dialogSuccessMessage);
                  this._bottomSheetRef.dismiss(true);
                },
                error: (err) => {
                  this.notificationService.openErrorNotification(this._dialogErrorMessage);
                  this._bottomSheetRef.dismiss(false);
                },
              });
          }
        });
    }
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  private setUpLanguageTexts(forNewBarangay: boolean) {
    if (forNewBarangay) {
      this._dialogTitle = this.translateService.instant(
        'CUSTOMER_ACCOUNTS_PAGE.ADD_CUSTOMER_ACCOUNT_DIALOG.TITLE'
      );
      this._dialogConfirmationMessage = this.translateService.instant(
        'CUSTOMER_ACCOUNTS_PAGE.ADD_CUSTOMER_ACCOUNT_DIALOG.CONFIRM'
      );
      this._dialogSuccessMessage = this.translateService.instant(
        'CUSTOMER_ACCOUNTS_PAGE.ADD_CUSTOMER_ACCOUNT_DIALOG.SUCCESS_MESSAGE'
      );
      this._dialogErrorMessage = this.translateService.instant(
        'CUSTOMER_ACCOUNTS_PAGE.ADD_CUSTOMER_ACCOUNT_DIALOG.ERROR_MESSAGE'
      );
    } else {
      this._dialogTitle = this.translateService.instant(
        'CUSTOMER_ACCOUNTS_PAGE.UPDATE_CUSTOMER_ACCOUNT_DIALOG.TITLE'
      );
      this._dialogConfirmationMessage = this.translateService.instant(
        'CUSTOMER_ACCOUNTS_PAGE.UPDATE_CUSTOMER_ACCOUNT_DIALOG.CONFIRM'
      );
      this._dialogSuccessMessage = this.translateService.instant(
        'CUSTOMER_ACCOUNTS_PAGE.UPDATE_CUSTOMER_ACCOUNT_DIALOG.SUCCESS_MESSAGE'
      );
      this._dialogErrorMessage = this.translateService.instant(
        'CUSTOMER_ACCOUNTS_PAGE.UPDATE_CUSTOMER_ACCOUNT_DIALOG.ERROR_MESSAGE'
      );
    }
  }

  get dialogTitle(): string {
    return this._dialogTitle;
  }

  get barangayForm(): FormGroup {
    return this._barangayForm;
  }
}
