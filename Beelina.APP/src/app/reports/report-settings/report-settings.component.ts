import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { ReportNotificationEmailAddressResult } from 'src/app/_models/results/report-notification-emailaddress-result';

import { ReportsService } from 'src/app/_services/reports.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';

@Component({
  selector: 'app-report-settings',
  templateUrl: './report-settings.component.html',
  styleUrls: ['./report-settings.component.scss']
})
export class ReportSettingsComponent implements OnInit {

  private _reportSettingsForm: FormGroup;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ReportSettingsComponent>,
    private dialogService: DialogService,
    private reportService: ReportsService,
    private formBuilder: FormBuilder,
    private snackBarService: MatSnackBar,
    private translateService: TranslateService,
  ) {
    this._reportSettingsForm = this.formBuilder.group({
      emailAddress: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.reportService.getReportNotificationEmailAddress()
      .subscribe((reportNotificationEmailAddress: ReportNotificationEmailAddressResult) => {
        this._reportSettingsForm.get('emailAddress').setValue(reportNotificationEmailAddress.emailAddress);
      });
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onConfirm() {
    this._reportSettingsForm.markAllAsTouched()
    if (this._reportSettingsForm.valid) {

      this.dialogService.openConfirmation(
        this.translateService.instant('REPORT_SETTINGS_DIALOG.CONFIRMATION_REPORT_SETTINGS_DIALOG.TITLE'),
        this.translateService.instant('REPORT_SETTINGS_DIALOG.CONFIRMATION_REPORT_SETTINGS_DIALOG.CONFIRM'),
      ).subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this.reportService
            .updateReportNotificationEmailAddress(this._reportSettingsForm.value.emailAddress)
            .subscribe({
              next: () => {
                this.snackBarService.open(
                  this.translateService.instant('REPORT_SETTINGS_DIALOG.CONFIRMATION_REPORT_SETTINGS_DIALOG.SUCCESS_MESSAGE'),
                  this.translateService.instant('GENERAL_TEXTS.CLOSE')
                )
                this._bottomSheetRef.dismiss();
              },
              error: () => {
                this.snackBarService.open(
                  this.translateService.instant('REPORT_SETTINGS_DIALOG.CONFIRMATION_REPORT_SETTINGS_DIALOG.ERROR_MESSAGE'),
                  this.translateService.instant('GENERAL_TEXTS.CLOSE')
                )
                this._bottomSheetRef.dismiss();
              }
            });
        }
      });
    }
  }

  get reportSettingsForm(): FormGroup {
    return this._reportSettingsForm;
  }
}
