import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgModule } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';

import { CustomUISharedModule } from '../shared/custom-ui-shared.module';
import { TransactionFilterModule } from './transaction-filter/transaction-filter.module';
import { ViewSelectedOrdersModule } from './view-selected-orders/view-selected-orders.module';
import { OrderTransactionsComponent } from './order-transactions.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatRippleModule,
    MatMenuModule,
    MatCheckboxModule,
    RouterModule.forChild([
      {
        path: '',
        component: OrderTransactionsComponent
      }
    ]),
    TranslateModule.forChild(),
    ScrollingModule,
    TransactionFilterModule,
    ViewSelectedOrdersModule
  ],
  declarations: [OrderTransactionsComponent]
})
export class OrderTransactionsModule { }
