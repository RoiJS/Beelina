import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { CustomerComponent } from './customer.component';
import { CustomerRoutingModule } from './customer.routing.module';
import { SharedModule } from '../shared/shared.module';

import { BarangaysEffects } from '../barangays/store/effects';
import { CustomerEffects } from './store/effects';
import { PaymentMethodsEffects } from '../payment-methods/store/effects';

import * as PaymentMethodReducers from '../payment-methods/store/reducers';
import * as CustomerStoresReducers from '../customer/store/reducers';
import * as BarangaysReducers from '../barangays/store/reducers';

@NgModule({
  imports: [
    SharedModule,
    CustomerRoutingModule,
    StoreModule.forFeature('paymentMethods', PaymentMethodReducers.reducers),
    StoreModule.forFeature('customerStores', CustomerStoresReducers.reducers),
    StoreModule.forFeature('barangays', BarangaysReducers.reducers),
    EffectsModule.forFeature([
      BarangaysEffects,
      PaymentMethodsEffects,
      CustomerEffects,
    ]),
  ],
  declarations: [CustomerComponent],
})
export class CustomerModule {}
