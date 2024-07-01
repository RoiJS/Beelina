import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';

import { CustomUISharedModule } from '../shared/custom-ui-shared.module';
import { BadOrdersComponent } from './bad-orders.component';

import { TransactionDatesEffects } from '../transaction-history/store/effects';
import * as TransactionDatesReducers from '../transaction-history/store/reducers';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBottomSheetModule,
    MatRippleModule,
    MatCheckboxModule,
    MatMenuModule,
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
export class BadOrdersModule { }
