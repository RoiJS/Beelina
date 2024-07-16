import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TranslateModule } from '@ngx-translate/core';

import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { PaymentsComponent } from './payments.component';
import { RegisterPaymentDialogModule } from '../register-payment-dialog/register-payment-dialog.module';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatIconModule,
    MatRippleModule,
    ScrollingModule,
    TranslateModule.forChild(),
    RegisterPaymentDialogModule,
    RouterModule.forChild([
      { path: '', component: PaymentsComponent }
    ])
  ],
  declarations: [PaymentsComponent]
})
export class PaymentsModule { }
