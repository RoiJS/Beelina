import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { Barangay } from 'src/app/_models/barangay';
import { BarangayService } from 'src/app/_services/barangay.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';

@Component({
  selector: 'app-manage-barangay',
  templateUrl: './manage-barangay.component.html',
  styleUrls: ['./manage-barangay.component.scss'],
})
export class ManageBarangayComponent implements OnInit {
  private _barangayForm: FormGroup;
  private _dialogTitle: string;
  private _dialogConfirmationMessage: string;
  private _dialogSuccessMessage: string;
  private _dialogErrorMessage: string;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ManageBarangayComponent>,
    private barangayService: BarangayService,
    private dialogService: DialogService,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      barangay: Barangay;
    },
    private formBuilder: FormBuilder,
    private snackBarService: MatSnackBar,
    private translateService: TranslateService
  ) {
    this.setUpLanguageTexts(this.data.barangay.id === 0);
    this._barangayForm = this.formBuilder.group({
      name: [data.barangay.name, [Validators.required]],
    });
  }

  ngOnInit() {}

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
            this.barangayService.updateBarangay(manageBarangay).subscribe({
              complete: () => {
                this._bottomSheetRef.dismiss();
                this.snackBarService.open(
                  this._dialogSuccessMessage,
                  this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                  {
                    duration: 5000,
                  }
                );
                this._bottomSheetRef.dismiss(true);
              },
              error: (err) => {
                this._bottomSheetRef.dismiss();
                this.snackBarService.open(
                  this._dialogErrorMessage,
                  this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                  {
                    duration: 5000,
                  }
                );
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
        'BARANGAYS_PAGE.ADD_BARANGAY_DIALOG.TITLE'
      );
      this._dialogConfirmationMessage = this.translateService.instant(
        'BARANGAYS_PAGE.ADD_BARANGAY_DIALOG.CONFIRM'
      );
      this._dialogSuccessMessage = this.translateService.instant(
        'BARANGAYS_PAGE.ADD_BARANGAY_DIALOG.SUCCESS_MESSAGE'
      );
      this._dialogErrorMessage = this.translateService.instant(
        'BARANGAYS_PAGE.ADD_BARANGAY_DIALOG.ERROR_MESSAGE'
      );
    } else {
      this._dialogTitle = this.translateService.instant(
        'BARANGAYS_PAGE.UPDATE_BARANGAY_DIALOG.TITLE'
      );
      this._dialogConfirmationMessage = this.translateService.instant(
        'BARANGAYS_PAGE.UPDATE_BARANGAY_DIALOG.CONFIRM'
      );
      this._dialogSuccessMessage = this.translateService.instant(
        'BARANGAYS_PAGE.UPDATE_BARANGAY_DIALOG.SUCCESS_MESSAGE'
      );
      this._dialogErrorMessage = this.translateService.instant(
        'BARANGAYS_PAGE.UPDATE_BARANGAY_DIALOG.ERROR_MESSAGE'
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
