import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';

import { CustomerComponent } from './customer.component';
import { CustomerRoutingModule } from './customer.routing.module';
import { BarangaysEffects } from '../barangays/store/effects';
import { CustomerEffects } from './store/effects';
import { PaymentMethodsEffects } from '../payment-methods/store/effects';

import * as PaymentMethodReducers from '../payment-methods/store/reducers';
import * as CustomerStoresReducers from '../customer/store/reducers';
import * as BarangaysReducers from '../barangays/store/reducers';
import { CustomUISharedModule } from '../shared/custom-ui-shared.module';

@NgModule({
  imports: [
    CommonModule,
    CustomerRoutingModule,
    CustomUISharedModule,
    MatIconModule,
    MatMenuModule,
    MatRippleModule,
    ScrollingModule,
    StoreModule.forFeature('paymentMethods', PaymentMethodReducers.reducers),
    StoreModule.forFeature('customerStores', CustomerStoresReducers.reducers),
    StoreModule.forFeature('barangays', BarangaysReducers.reducers),
    EffectsModule.forFeature([
      BarangaysEffects,
      PaymentMethodsEffects,
      CustomerEffects,
    ]),
    TranslateModule.forChild(),
  ],
  declarations: [CustomerComponent],
})
export class CustomerModule {}
