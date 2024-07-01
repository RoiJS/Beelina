import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatRippleModule } from '@angular/material/core';

import { OrderTransactionsComponent } from './order-transactions.component';
import { CustomUISharedModule } from '../shared/custom-ui-shared.module';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatRippleModule,
    RouterModule.forChild([
      {
        path: '',
        component: OrderTransactionsComponent
      }
    ]),
    TranslateModule.forChild(),
    ScrollingModule,
  ],
  declarations: [OrderTransactionsComponent]
})
export class OrderTransactionsModule { }
