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
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { DraftTransactionsComponent } from './draft-transactions.component';
import { TransactionDatesEffects } from '../transaction-history/store/effects';
import { CustomUISharedModule } from '../shared/custom-ui-shared.module';

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
        component: DraftTransactionsComponent,
        title: 'MAIN_MENU.DRAFT_ORDERS',
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
export class DraftTransactionsModule { }
