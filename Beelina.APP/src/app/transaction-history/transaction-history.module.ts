import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../shared/shared.module';
import { TransactionHistoryComponent } from './transaction-history.component';

import { TransactionDatesEffects } from '../transaction-history/store/effects';

import * as TransactionDatesReducers from '../transaction-history/store/reducers';

@NgModule({
  imports: [
    SharedModule,
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
    EffectsModule.forFeature([
      TransactionDatesEffects,
    ]),
  ],
  declarations: [TransactionHistoryComponent],
})
export class TransactionHistoryModule {}
