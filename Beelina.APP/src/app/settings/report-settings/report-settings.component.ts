import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { ReportNotificationEmailAddressResult } from 'src/app/_models/results/report-notification-emailaddress-result';

import { ReportsService } from 'src/app/_services/reports.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';

@Component({
  selector: 'app-report-settings',
  templateUrl: './report-settings.component.html',
  styleUrls: ['./report-settings.component.scss']
})
export class ReportSettingsComponent extends BaseComponent implements OnInit {

  dialogService = inject(DialogService);
  notificationService = inject(NotificationService);
  translateService = inject(TranslateService);
  reportService = inject(ReportsService);
  formBuilder = inject(FormBuilder);


  reportSettingsForm = this.formBuilder.group({
    emailAddress: ['', Validators.required],
  });

  constructor() {
    super();
  }

  ngOnInit() {
    this.reportService.getReportNotificationEmailAddress()
      .subscribe((reportNotificationEmailAddress: ReportNotificationEmailAddressResult) => {
        this.reportSettingsForm.get('emailAddress').setValue(reportNotificationEmailAddress.emailAddress);
      });
  }

  save() {
    this.reportSettingsForm.markAllAsTouched()
    if (this.reportSettingsForm.valid) {

      this.dialogService.openConfirmation(
        this.translateService.instant("SETTINGS_PAGE.ORDER_TRANSACTION_SETTINGS_SUBPAGE.SAVE_SETTINGS_DIALOG.TITLE"),
        this.translateService.instant("SETTINGS_PAGE.ORDER_TRANSACTION_SETTINGS_SUBPAGE.SAVE_SETTINGS_DIALOG.CONFIRM"),
      ).subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this._isLoading = true;
          this.reportService
            .updateReportNotificationEmailAddress(this.reportSettingsForm.value.emailAddress)
            .subscribe({
              next: () => {
                this.notificationService.openSuccessNotification(this.translateService.instant("SETTINGS_PAGE.ORDER_TRANSACTION_SETTINGS_SUBPAGE.SAVE_SETTINGS_DIALOG.SUCCESS_MESSAGE"));
                this._isLoading = false;
              },
              error: () => {
                this.notificationService.openErrorNotification(this.translateService.instant("SETTINGS_PAGE.ORDER_TRANSACTION_SETTINGS_SUBPAGE.SAVE_SETTINGS_DIALOG.ERROR_MESSAGE"));
                this._isLoading = false;
              }
            });
        }
      });
    }
  }
}
