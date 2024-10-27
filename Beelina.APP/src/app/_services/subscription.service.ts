import { inject, Injectable } from '@angular/core';
import { Apollo, gql, MutationResult } from 'apollo-angular';
import { map } from 'rxjs';

import { IClientSubscriptionInput } from '../_interfaces/inputs/iclient-subscription.input';
import { ClientSubscription } from '../_models/client-subscription';
import { IClientSubscriptionOutput } from '../_interfaces/outputs/iclient-subscription.output';

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

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  apollo = inject(Apollo);

  constructor() { }

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
