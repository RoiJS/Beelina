import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';

import { UserSetting } from 'src/app/_models/user-setting';
import { UserAgentOrderTransactionSettings } from 'src/app/_models/user-agent-order-transaction-settings.model';
import { PrintReceiptFontSizeEnum } from 'src/app/_enum/print-receipt-font-size.enum';

@Injectable({
  providedIn: 'root'
})
export class LocalUserSettingsDbService {

  private localDbService = inject(NgxIndexedDBService);

  async getLocalUserSettings() {
    const localUserSettings = <Array<UserSetting>>await firstValueFrom(this.localDbService.getAll('userSettings'));
    if (localUserSettings && localUserSettings.length > 0) {
      return localUserSettings[0];
    }
    return new UserSetting(); // This will use the default values from the model
  }

  async saveLocalUserSettings(userSetting: UserSetting) {
    try {
      await this.clear();
      await firstValueFrom(this.localDbService.add('userSettings', userSetting));
    } catch (error) {
      console.error(error);
    }
  }

  async updateOrderTransactionSettings(userAgentOrderTransactionSettings: UserAgentOrderTransactionSettings) {
    const userSettings = await this.getLocalUserSettings();
    userSettings.allowSendReceipt = userAgentOrderTransactionSettings.allowSendReceipt;
    userSettings.allowAutoSendReceipt = userAgentOrderTransactionSettings.allowAutoSendReceipt;
    userSettings.sendReceiptEmailAddress = userAgentOrderTransactionSettings.sendReceiptEmailAddress;
    userSettings.allowPrintReceipt = userAgentOrderTransactionSettings.allowPrintReceipt;
    userSettings.autoPrintReceipt = userAgentOrderTransactionSettings.autoPrintReceipt;
    userSettings.printReceiptFontSize = userAgentOrderTransactionSettings.printReceiptFontSize || PrintReceiptFontSizeEnum.Default;

    this.localDbService
      .update('userSettings', userSettings)
      .subscribe((result: UserSetting) => {
        console.info(result);
      });
  }

  async clear() {
    try {
      await firstValueFrom(this.localDbService.clear('userSettings'));
    } catch (error) {
      console.error(error);
    }
  }
}
