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
    sendReceiptForm: this.formBuilder.group({
      allowSendReceipt: [false, Validators.required],
      allowAutoSendReceipt: [false, Validators.required],
      sendReceiptEmailAddress: ["", Validators.required],
    }),
    printReceiptForm: this.formBuilder.group({
      allowPrintReceipt: [false, Validators.required],
      autoPrintReceipt: [false, Validators.required],
    })
  });

  constructor() {
    super();
  }

  ngOnInit() {
    this.userAgentSettingsService
      .getOrderTransactionsSettings(this.authService.userId)
      .subscribe((userAgentOrderTransactionSettings: UserAgentOrderTransactionSettings) => {
        this.orderTransactionSettingsForm.setValue({
          sendReceiptForm: {
            allowSendReceipt: userAgentOrderTransactionSettings.allowSendReceipt,
            allowAutoSendReceipt: userAgentOrderTransactionSettings.allowAutoSendReceipt,
            sendReceiptEmailAddress: userAgentOrderTransactionSettings.sendReceiptEmailAddress,
          },
          printReceiptForm: {
            allowPrintReceipt: userAgentOrderTransactionSettings.allowPrintReceipt,
            autoPrintReceipt: userAgentOrderTransactionSettings.autoPrintReceipt,
          }
        })
      });
  }

  validate() {
    const sendReceiptForm = this.orderTransactionSettingsForm.value.sendReceiptForm;

    if (sendReceiptForm.allowSendReceipt) {
      if (!sendReceiptForm.sendReceiptEmailAddress) {
        return false;
      }
    }

    return true;
  }

  save() {
    if (this.validate()) {
      const allowSendReceipt = this.orderTransactionSettingsForm.value.sendReceiptForm.allowSendReceipt;
      const allowAutoSendReceipt = this.orderTransactionSettingsForm.value.sendReceiptForm.allowAutoSendReceipt;
      const sendReceiptEmailAddress = this.orderTransactionSettingsForm.value.sendReceiptForm.sendReceiptEmailAddress
      const allowPrintReceipt = this.orderTransactionSettingsForm.value.printReceiptForm.allowPrintReceipt;
      const autoPrintReceipt = this.orderTransactionSettingsForm.value.printReceiptForm.autoPrintReceipt;

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
