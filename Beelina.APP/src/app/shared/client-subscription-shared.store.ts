import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";

import { ClientSubscriptionDetails } from "../_models/client-subscription-details.model";
import { LocalClientSubscriptionDbService } from "../_services/local-db/local-client-subscription-db.service";

export interface IClientSubscriptionState {
  clientSubscription: ClientSubscriptionDetails;
}

export const initialState: IClientSubscriptionState = {
  clientSubscription: new ClientSubscriptionDetails(),
};

export const ClientSubscriptionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService)) => ({
    initializeClientSubscription: async () => {
      const clientSubscription = await localClientSubscriptionDbService.getLocalClientSubsription();
      patchState(store, {
        clientSubscription
      })
    }
  }))
);
