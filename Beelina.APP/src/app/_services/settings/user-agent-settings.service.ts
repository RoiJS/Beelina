import { inject, Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, gql, MutationResult } from 'apollo-angular';
import { catchError, map } from 'rxjs';

import { IUserAgentOrderTransactionSettingsInput } from 'src/app/_interfaces/inputs/iuser-agent-order-transaction-settings.input';
import { IUserAgentOrderTransactionQueryPayload } from 'src/app/_interfaces/payloads/iuser-agent-order-transaction-settings.payload';
import { UserAgentOrderTransactionSettings } from 'src/app/_models/user-agent-order-transaction-settings.model';

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
    const userAccountInput: IUserAgentOrderTransactionSettingsInput = {
      allowSendReceipt: userAgentOrderTransactionSettings.allowSendReceipt,
      allowAutoSendReceipt: userAgentOrderTransactionSettings.allowAutoSendReceipt,
      sendReceiptEmailAddress: userAgentOrderTransactionSettings.sendReceiptEmailAddress
    };

    return this.apollo
      .mutate({
        mutation: SAVE_USER_AGENT_ORDER_TRANSACTION_SETTINGS,
        variables: {
          userAccountInput,
        },
      })
      .pipe(
        map(
          (
            result: MutationResult<{ boolean: boolean }>
          ) => {
            const output = result.data.boolean;
            return output;
          }
        ),
        catchError((error) => {
          throw new Error(error);
        })
      );
  }
}
