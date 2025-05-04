import { inject, Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, gql, MutationResult } from 'apollo-angular';
import { catchError, from, map } from 'rxjs';

import { IUserAgentOrderTransactionSettingsInput } from 'src/app/_interfaces/inputs/iuser-agent-order-transaction-settings.input';
import { ISaveUserAgentOrderTransactionSettingsOutput } from 'src/app/_interfaces/outputs/isave-user-agent-order-transation-settings-.output';
import { IUserAgentOrderTransactionQueryPayload } from 'src/app/_interfaces/payloads/iuser-agent-order-transaction-settings.payload';

import { AuthService } from '../auth.service';
import { NetworkService } from '../network.service';
import { LocalUserSettingsDbService } from '../local-db/local-user-settings-db.service';
import { UserAgentOrderTransactionSettings } from 'src/app/_models/user-agent-order-transaction-settings.model';

import { UserSetting } from 'src/app/_models/user-setting';

const GET_ORDER_TRANSACTION_SETTINGS = gql`
  query($userId: Int!) {
    orderTransactionSettings(userId: $userId) {
      allowSendReceipt
      allowAutoSendReceipt
      sendReceiptEmailAddress
      allowPrintReceipt
      autoPrintReceipt
    }
  }
`;

const SAVE_USER_AGENT_ORDER_TRANSACTION_SETTINGS = gql`
  mutation($userAgentOrderTransactionSettingInput: UserAgentOrderTransactionSettingInput!) {
    saveUserAgentOrderTransactionSettings(input: { userAgentOrderTransactionSettingInput: $userAgentOrderTransactionSettingInput }){
      boolean
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class UserAgentSettingsService {
  apollo = inject(Apollo);
  authService = inject(AuthService);
  localUserSettingsDbService = inject(LocalUserSettingsDbService);
  networkService = inject(NetworkService);

  constructor() { }

  getOrderTransactonsSettings(userId: number) {

    if (!this.networkService.isOnline.value) {
      return from(this.localUserSettingsDbService.getLocalUserSettings())
        .pipe(
          map((userSetting: UserSetting) => {
            const userAgentOrderTransactionSettings = new UserAgentOrderTransactionSettings();
            userAgentOrderTransactionSettings.allowSendReceipt = userSetting.allowSendReceipt;
            userAgentOrderTransactionSettings.allowAutoSendReceipt = userSetting.allowAutoSendReceipt;
            userAgentOrderTransactionSettings.sendReceiptEmailAddress = userSetting.sendReceiptEmailAddress;
            userAgentOrderTransactionSettings.allowPrintReceipt = userSetting.allowPrintReceipt;
            userAgentOrderTransactionSettings.autoPrintReceipt = userSetting.autoPrintReceipt;
            return userAgentOrderTransactionSettings;
          })
        );;
    }

    return this.apollo
      .watchQuery({
        query: GET_ORDER_TRANSACTION_SETTINGS,
        variables: {
          userId,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              orderTransactionSettings: IUserAgentOrderTransactionQueryPayload;
            }>
          ) => {
            const data = <IUserAgentOrderTransactionQueryPayload>(
              result.data.orderTransactionSettings
            );

            const userAgentOrderTransactionSettings = new UserAgentOrderTransactionSettings();
            userAgentOrderTransactionSettings.allowSendReceipt = data.allowSendReceipt;
            userAgentOrderTransactionSettings.allowAutoSendReceipt = data.allowAutoSendReceipt;
            userAgentOrderTransactionSettings.sendReceiptEmailAddress = data.sendReceiptEmailAddress;
            userAgentOrderTransactionSettings.allowPrintReceipt = data.allowPrintReceipt;
            userAgentOrderTransactionSettings.autoPrintReceipt = data.autoPrintReceipt;
            return userAgentOrderTransactionSettings;
          }
        ),
        catchError((error) => {
          throw new Error(error);
        })
      );
  }

  async autoSaveUserAgentOrderTransactionSettings() {
    const userSettings = await this.localUserSettingsDbService.getLocalUserSettings();
    console.log(userSettings);

    const localUserSettings: IUserAgentOrderTransactionSettingsInput = {
      userId: this.authService.userId,
      allowSendReceipt: userSettings.allowSendReceipt,
      allowAutoSendReceipt: userSettings.allowAutoSendReceipt,
      sendReceiptEmailAddress: userSettings.sendReceiptEmailAddress,
      allowPrintReceipt: userSettings.allowPrintReceipt,
      autoPrintReceipt: userSettings.autoPrintReceipt,
    };

    return this.saveUserAgentOrderTransactionSettings(localUserSettings).subscribe((result: boolean) => result);
  }

  saveUserAgentOrderTransactionSettings(userAgentOrderTransactionSettings: UserAgentOrderTransactionSettings) {
    const userAgentOrderTransactionSettingInput: IUserAgentOrderTransactionSettingsInput = {
      userId: userAgentOrderTransactionSettings.userId,
      allowSendReceipt: userAgentOrderTransactionSettings.allowSendReceipt,
      allowAutoSendReceipt: userAgentOrderTransactionSettings.allowAutoSendReceipt,
      sendReceiptEmailAddress: userAgentOrderTransactionSettings.sendReceiptEmailAddress,
      allowPrintReceipt: userAgentOrderTransactionSettings.allowPrintReceipt,
      autoPrintReceipt: userAgentOrderTransactionSettings.autoPrintReceipt,
    };

    // Save local when offline mode
    if (!this.networkService.isOnline.value) {
      return from(this.localUserSettingsDbService.updateOrderTransactionSettings(userAgentOrderTransactionSettings))
        .pipe(
          map(() => {
            return true; // always return true indicates that saving is successful
          })
        );
    }

    return this.apollo
      .mutate({
        mutation: SAVE_USER_AGENT_ORDER_TRANSACTION_SETTINGS,
        variables: {
          userAgentOrderTransactionSettingInput,
        },
      })
      .pipe(
        map(
          (
            result: MutationResult<{ saveUserAgentOrderTransactionSettings: ISaveUserAgentOrderTransactionSettingsOutput }>
          ) => {
            const output = result.data.saveUserAgentOrderTransactionSettings.boolean;
            if (output) {
              this.localUserSettingsDbService.updateOrderTransactionSettings(userAgentOrderTransactionSettings);
            }
            return output;
          }
        ),
        catchError((error) => {
          throw new Error(error);
        })
      );
  }
}
