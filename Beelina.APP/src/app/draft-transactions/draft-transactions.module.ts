import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { DraftTransactionsComponent } from './draft-transactions.component';
import { SharedModule } from '../shared/shared.module';

import * as TransactionDatesReducers from '../transaction-history/store/reducers';
import { TransactionDatesEffects } from '../transaction-history/store/effects';

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
        component: DraftTransactionsComponent,
        title: 'MAIN_MENU.DRAFT_TRANSACTIONS',
      },
      {
        path: 'transactions/:date',
        loadChildren: () =>
          import('./draft-transaction/draft-transaction.module').then(
            (m) => m.DraftTransactionModule
          ),
      },
    ]),
    EffectsModule.forFeature([TransactionDatesEffects]),
  ],
  declarations: [DraftTransactionsComponent],
})
export class DraftTransactionsModule {}
