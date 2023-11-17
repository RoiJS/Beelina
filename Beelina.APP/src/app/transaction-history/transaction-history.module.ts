import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { CustomUISharedModule } from '../shared/custom-ui-shared.module';
import * as TransactionDatesReducers from '../transaction-history/store/reducers';
import { TransactionHistoryComponent } from './transaction-history.component';
import { TransactionDatesEffects } from '../transaction-history/store/effects';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    ScrollingModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBottomSheetModule,
    StoreModule.forFeature(
      'transactionDates',
      TransactionDatesReducers.reducers
    ),
    RouterModule.forChild([
      {
        path: '',
        component: TransactionHistoryComponent,
        title: 'MAIN_MENU.TRANSACTION_HISTORY',
      },
      {
        path: 'transactions/:date',
        loadChildren: () =>
          import('./transactions/transactions.module').then(
            (m) => m.TransactionsModule
          ),
      },
    ]),
    EffectsModule.forFeature([TransactionDatesEffects]),
    TranslateModule.forChild(),
  ],
  declarations: [TransactionHistoryComponent],
})
export class TransactionHistoryModule {}
