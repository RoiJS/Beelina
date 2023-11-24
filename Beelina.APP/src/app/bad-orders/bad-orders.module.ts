import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { StoreModule } from '@ngrx/store';

import { BadOrdersComponent } from './bad-orders.component';
import { CustomUISharedModule } from '../shared/custom-ui-shared.module';

import * as TransactionDatesReducers from '../transaction-history/store/reducers';
import { TransactionDatesEffects } from '../transaction-history/store/effects';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBottomSheetModule,
    MatRippleModule,
    ScrollingModule,
    StoreModule.forFeature(
      'transactionDates',
      TransactionDatesReducers.reducers
    ),
    RouterModule.forChild([
      {
        path: '',
        component: BadOrdersComponent,
        title: 'MAIN_MENU.BAD_ORDERS',
      },
      {
        path: 'transactions/:date',
        loadChildren: () =>
          import('./bad-order/bad-order.module').then((m) => m.BadOrderModule),
      },
    ]),
    EffectsModule.forFeature([TransactionDatesEffects]),
    TranslateModule.forChild(),
  ],
  declarations: [BadOrdersComponent],
})
export class BadOrdersModule {}
