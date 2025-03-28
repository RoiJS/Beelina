import { inject, Injectable } from '@angular/core';
import { Apollo, gql, MutationResult } from 'apollo-angular';
import { ApolloQueryResult } from '@apollo/client/core';
import { map } from 'rxjs';

import { IClientSubscriptionInput } from '../_interfaces/inputs/iclient-subscription.input';
import { IClientSubscriptionOutput } from '../_interfaces/outputs/iclient-subscription.output';
import { IClientSubscriptionDetailsPayload } from '../_interfaces/payloads/iclient-subscription-details.payload';
import { ClientSubscriptionDetailsResult } from '../_models/results/client-subscription-details-result';
import { ClientSubscriptionNotExistsError } from '../_models/errors/client-subscription-not-exists.error';
import { ClientSubscriptionDetails } from '../_models/client-subscription-details.model';
import { ClientSubscription } from '../_models/client-subscription';
import { LocalClientSubscriptionDbService } from './local-db/local-client-subscription-db.service';

const UPDATE_CLIENT_SUBSCRIPTION = gql`
  mutation($clientSubscriptionInput: ClientSubscriptionInput!) {
      updateClientSubscription(input: { clientSubscriptionInput: $clientSubscriptionInput }){
          boolean
      }
  }
`;

const APPROVE_CLIENT_SUBSCRIPTION = gql`
  mutation($clientSubscriptionInput: ClientSubscriptionInput!) {
      approveClientSubscription(input: { clientSubscriptionInput: $clientSubscriptionInput }){
          boolean
      }
  }
`;

const GET_CLIENT_SUBSCRIPTION = gql`
 query($appSecretToken: String!, $startDate: String!) {
    clientSubscriptionDetails(appSecretToken: $appSecretToken, startDate: $startDate) {
        typename: __typename
        ... on ClientSubscriptionDetailsResult {
            clientId
            subscriptionId
            subscriptionName
            startDate
            endDate
            currentCustomReportAddonPrice
            currentRegisterUserAddonPrice
            currentSubscriptionPrice
            customerAccountsMax
            customersMax
            customReportAddOnActive
            dashboardDistributionPageActive
            offlineModeActive
            orderPrintActive
            productSKUMax
            registerUserAddOnActive
            sendReportEmailActive
            subscriptionFeatureId
            topProductsPageActive
            userAccountsMax
            subscriptionFeatureAvailableReports {
                id
                reportId
                subscriptionFeatureId
            }
            subscriptionFeatureHideDashboardWidgets {
                id
                subscriptionFeatureId
                dashboardModuleWidgetId
            }
        }
        ... on ClientSubscriptionNotExistsError {
            message
        }
    }
}
`;

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  apollo = inject(Apollo);
  localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService);

  constructor() { }

  getClientSubscription(appSecretToken: string, startDate: string = "") {
    return this.apollo
      .watchQuery({
        query: GET_CLIENT_SUBSCRIPTION,
        variables: {
          appSecretToken,
          startDate
        },
      })
      .valueChanges.pipe(
        map(
          async (
            result: ApolloQueryResult<{
              clientSubscriptionDetails: IClientSubscriptionDetailsPayload;
            }>
          ) => {
            const data = result.data.clientSubscriptionDetails;

            if (data.typename === 'ClientSubscriptionDetailsResult') {
              const currentClientSubscriptionDetailsResult = <ClientSubscriptionDetailsResult>result.data.clientSubscriptionDetails;
              const clientSubscription = new ClientSubscriptionDetails();
              clientSubscription.clientId = currentClientSubscriptionDetailsResult.clientId;
              clientSubscription.subscriptionId = currentClientSubscriptionDetailsResult.subscriptionId;
              clientSubscription.subscriptionName = currentClientSubscriptionDetailsResult.subscriptionName;
              clientSubscription.subscriptionFeatureId = currentClientSubscriptionDetailsResult.subscriptionFeatureId;
              clientSubscription.startDate = currentClientSubscriptionDetailsResult.startDate;
              clientSubscription.endDate = currentClientSubscriptionDetailsResult.endDate;
              clientSubscription.offlineModeActive = currentClientSubscriptionDetailsResult.offlineModeActive;
              clientSubscription.productSKUMax = currentClientSubscriptionDetailsResult.productSKUMax;
              clientSubscription.topProductsPageActive = currentClientSubscriptionDetailsResult.topProductsPageActive;
              clientSubscription.customerAccountsMax = currentClientSubscriptionDetailsResult.customerAccountsMax;
              clientSubscription.customersMax = currentClientSubscriptionDetailsResult.customersMax;
              clientSubscription.dashboardDistributionPageActive = currentClientSubscriptionDetailsResult.dashboardDistributionPageActive;
              clientSubscription.orderPrintActive = currentClientSubscriptionDetailsResult.orderPrintActive;
              clientSubscription.sendReportEmailActive = currentClientSubscriptionDetailsResult.sendReportEmailActive;
              clientSubscription.userAccountsMax = currentClientSubscriptionDetailsResult.userAccountsMax;
              clientSubscription.registerUserAddOnActive = currentClientSubscriptionDetailsResult.registerUserAddOnActive;
              clientSubscription.customReportAddOnActive = currentClientSubscriptionDetailsResult.customReportAddOnActive;
              clientSubscription.currentSubscriptionPrice = currentClientSubscriptionDetailsResult.currentSubscriptionPrice;
              clientSubscription.currentRegisterUserAddonPrice = currentClientSubscriptionDetailsResult.currentRegisterUserAddonPrice;
              clientSubscription.currentCustomReportAddonPrice = currentClientSubscriptionDetailsResult.currentCustomReportAddonPrice;
              clientSubscription.subscriptionFeatureAvailableReports = currentClientSubscriptionDetailsResult.subscriptionFeatureAvailableReports;
              clientSubscription.subscriptionFeatureHideDashboardWidgets = currentClientSubscriptionDetailsResult.subscriptionFeatureHideDashboardWidgets;

              await this.localClientSubscriptionDbService.saveClientSubscriptionSettings(clientSubscription);

              return clientSubscription;
            }
            if (data.typename === 'ClientSubscriptionNotExistsError')
              throw new Error(
                (<ClientSubscriptionNotExistsError>result.data.clientSubscriptionDetails).message
              );

            return null;
          }
        )
      );
  }

  updateClientSubscription(clientSubscription: ClientSubscription) {
    const clientSubscriptionInput: IClientSubscriptionInput = {
      id: clientSubscription.id,
      clientId: clientSubscription.clientId,
      subscriptionFeatureId: clientSubscription.subscriptionFeatureId,
      startDate: clientSubscription.startDate,
      endDate: clientSubscription.endDate,
    };

    return this.apollo
      .mutate({
        mutation: UPDATE_CLIENT_SUBSCRIPTION,
        variables: {
          clientSubscriptionInput,
        },
      })
      .pipe(
        map((result: MutationResult<{ updateClientSubscription: IClientSubscriptionOutput }>) => {
          const output = result.data.updateClientSubscription;
          const payload = output.clientSubscription;
          const errors = output.errors;

          if (payload) {
            return payload;
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  approveClientSubscription(clientSubscription: ClientSubscription) {
    const clientSubscriptionInput: IClientSubscriptionInput = {
      id: clientSubscription.id,
      clientId: clientSubscription.clientId,
      subscriptionFeatureId: clientSubscription.subscriptionFeatureId,
      startDate: clientSubscription.startDate,
      endDate: clientSubscription.endDate,
    };

    return this.apollo
      .mutate({
        mutation: APPROVE_CLIENT_SUBSCRIPTION,
        variables: {
          clientSubscriptionInput,
        },
      })
      .pipe(
        map((result: MutationResult<{ updateClientSubscription: IClientSubscriptionOutput }>) => {
          const output = result.data.updateClientSubscription;
          const payload = output.boolean;
          const errors = output.errors;

          if (payload) {
            return payload;
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

}
