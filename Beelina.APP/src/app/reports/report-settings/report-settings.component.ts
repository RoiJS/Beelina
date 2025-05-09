import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { ReportNotificationEmailAddressResult } from 'src/app/_models/results/report-notification-emailaddress-result';

import { ReportsService } from 'src/app/_services/reports.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';

@Component({
  selector: 'app-report-settings',
  templateUrl: './report-settings.component.html',
  styleUrls: ['./report-settings.component.scss']
})
export class ReportSettingsComponent implements OnInit {

  private _reportSettingsForm: FormGroup;

  private _bottomSheetRef = inject(MatBottomSheetRef<ReportSettingsComponent>);
  private dialogService = inject(DialogService);
  private reportService = inject(ReportsService);
  private formBuilder = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslateService);

  constructor() {
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
                this.notificationService.openSuccessNotification(this.translateService.instant('REPORT_SETTINGS_DIALOG.CONFIRMATION_REPORT_SETTINGS_DIALOG.SUCCESS_MESSAGE'));
                this._bottomSheetRef.dismiss();
              },
              error: () => {
                this.notificationService.openErrorNotification(this.translateService.instant('REPORT_SETTINGS_DIALOG.CONFIRMATION_REPORT_SETTINGS_DIALOG.ERROR_MESSAGE'));
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
