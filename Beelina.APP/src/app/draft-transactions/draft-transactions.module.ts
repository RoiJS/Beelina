import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';

import { DraftTransactionsComponent } from './draft-transactions.component';
import * as TransactionDatesReducers from '../transaction-history/store/reducers';
import { TransactionDatesEffects } from '../transaction-history/store/effects';
import { CustomUISharedModule } from '../shared/custom-ui-shared.module';

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
    TranslateModule.forChild(),
  ],
  declarations: [DraftTransactionsComponent],
})
export class DraftTransactionsModule {}
