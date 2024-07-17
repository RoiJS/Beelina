import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { PaymentMethodsEffects } from 'src/app/payment-methods/store/effects';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import * as PaymentMethodReducers from '../../../payment-methods/store/reducers';
import { TransactionDetailsComponent } from './transaction-details.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatListModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    StoreModule.forFeature('paymentMethods', PaymentMethodReducers.reducers),
    EffectsModule.forFeature([
      PaymentMethodsEffects,
    ]),
    RouterModule.forChild([
      {
        path: '',
        component: TransactionDetailsComponent,
        title: 'TRANSACTION_DETAILS_PAGE.TITLE',
      },
      {
        path: ':transactionId',
        loadChildren: () => import('./payments/payments.module').then(m => m.PaymentsModule),
      },
    ]),
    TranslateModule.forChild(),
  ],
  declarations: [TransactionDetailsComponent],
})
export class TransactionDetailsModule { }
