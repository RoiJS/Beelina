import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DraftTransactionsComponent } from './draft-transactions.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    SharedModule,
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
  ],
  declarations: [DraftTransactionsComponent],
})
export class DraftTransactionsModule {}
