import { inject, Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, gql, MutationResult } from 'apollo-angular';
import { catchError, map } from 'rxjs';

import { IUserAgentOrderTransactionSettingsInput } from 'src/app/_interfaces/inputs/iuser-agent-order-transaction-settings.input';
import { ISaveUserAgentOrderTransactionSettingsOutput } from 'src/app/_interfaces/outputs/isave-user-agent-order-transation-settings-.output';
import { IUserAgentOrderTransactionQueryPayload } from 'src/app/_interfaces/payloads/iuser-agent-order-transaction-settings.payload';
import { UserAgentOrderTransactionSettings } from 'src/app/_models/user-agent-order-transaction-settings.model';
import { LocalUserSettingsDbService } from '../local-db/local-user-settings-db.service';

const GET_ORDER_TRANSACTION_SETTINGS = gql`
  query($userId: Int!) {
    orderTransactionSettings(userId: $userId) {
      allowSendReceipt
      allowAutoSendReceipt
      sendReceiptEmailAddress
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
  localUserSettingsDbService = inject(LocalUserSettingsDbService);

  constructor() { }

  getOrderTransactonsSettings(userId: number) {
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
            return userAgentOrderTransactionSettings;
          }
        ),
        catchError((error) => {
          throw new Error(error);
        })
      );
  }

  saveUserAgentOrderTransactionSettings(userAgentOrderTransactionSettings: UserAgentOrderTransactionSettings) {
    const userAgentOrderTransactionSettingInput: IUserAgentOrderTransactionSettingsInput = {
      userId: userAgentOrderTransactionSettings.userId,
      allowSendReceipt: userAgentOrderTransactionSettings.allowSendReceipt,
      allowAutoSendReceipt: userAgentOrderTransactionSettings.allowAutoSendReceipt,
      sendReceiptEmailAddress: userAgentOrderTransactionSettings.sendReceiptEmailAddress
    };

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
