import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';

import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

import { UserAgentOrderTransactionSettings } from 'src/app/_models/user-agent-order-transaction-settings.model';

import { AuthService } from 'src/app/_services/auth.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { UserAgentSettingsService } from 'src/app/_services/settings/user-agent-settings.service';
import { UserAccountService } from 'src/app/_services/user-account.service';

@Component({
  selector: 'app-order-transactions',
  templateUrl: './order-transactions.component.html',
  styleUrls: ['./order-transactions.component.scss']
})
export class OrderTransactionsComponent extends BaseComponent implements OnInit {

  authService = inject(AuthService);
  dialogService = inject(DialogService);
  notificationService = inject(NotificationService);
  translateService = inject(TranslateService);
  userService = inject(UserAccountService);
  userAgentSettingsService = inject(UserAgentSettingsService);
  formBuilder = inject(FormBuilder);

  orderTransactionSettingsForm = this.formBuilder.group({
    allowSendReceipt: [false, Validators.required],
    allowAutoSendReceipt: [false, Validators.required],
    sendReceiptEmailAddress: ["", Validators.required],
    allowPrintReceipt: [false, Validators.required],
    autoPrintReceipt: [false, Validators.required],
  });

  constructor() {
    super();
  }

  ngOnInit() {
    this.userAgentSettingsService
      .getOrderTransactonsSettings(this.authService.userId)
      .subscribe((userAgentOrderTransactionSettings: UserAgentOrderTransactionSettings) => {
        this.orderTransactionSettingsForm.patchValue(userAgentOrderTransactionSettings);
      });
  }

  save() {
    if (this.orderTransactionSettingsForm.valid) {
      const allowSendReceipt = this.orderTransactionSettingsForm.value.allowSendReceipt;
      const allowAutoSendReceipt = this.orderTransactionSettingsForm.value.allowAutoSendReceipt;
      const sendReceiptEmailAddress = this.orderTransactionSettingsForm.value.sendReceiptEmailAddress
      const allowPrintReceipt = this.orderTransactionSettingsForm.value.allowPrintReceipt;
      const autoPrintReceipt = this.orderTransactionSettingsForm.value.autoPrintReceipt;

      this.dialogService.openConfirmation(
        this.translateService.instant("SETTINGS_PAGE.ORDER_TRANSACTION_SETTINGS_SUBPAGE.SAVE_SETTINGS_DIALOG.TITLE"),
        this.translateService.instant("SETTINGS_PAGE.ORDER_TRANSACTION_SETTINGS_SUBPAGE.SAVE_SETTINGS_DIALOG.CONFIRM"),
      ).subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this._isLoading = true;

          const userAgentOrderTransactionSettings: UserAgentOrderTransactionSettings = {
            userId: this.authService.userId,
            allowSendReceipt,
            allowAutoSendReceipt,
            sendReceiptEmailAddress,
            allowPrintReceipt,
            autoPrintReceipt
          };

          this.userAgentSettingsService
            .saveUserAgentOrderTransactionSettings(userAgentOrderTransactionSettings)
            .subscribe({
              next: (result: boolean) => {
                this._isLoading = false;

                if (result) {
                  this.notificationService.openSuccessNotification(
                    this.translateService.instant("SETTINGS_PAGE.ORDER_TRANSACTION_SETTINGS_SUBPAGE.SAVE_SETTINGS_DIALOG.SUCCESS_MESSAGE"),
                  );
                } else {

                  this.notificationService.openErrorNotification(
                    this.translateService.instant("SETTINGS_PAGE.ORDER_TRANSACTION_SETTINGS_SUBPAGE.SAVE_SETTINGS_DIALOG.ERROR_MESSAGE"),
                  );
                }
              },
              error: () => {
                this._isLoading = false;
                this.notificationService.openErrorNotification(
                  this.translateService.instant("SETTINGS_PAGE.ORDER_TRANSACTION_SETTINGS_SUBPAGE.SAVE_SETTINGS_DIALOG.ERROR_MESSAGE"),
                );
              }
            });
        }
      });
    }
  }
}
