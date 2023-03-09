import { NgModule } from '@angular/core';

import { TransactionsComponent } from './transactions.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: TransactionsComponent,
        title: 'TRANSACTION_HISTORY_PAGE.TITLE',
      },
      {
        path: ':id',
        loadChildren: () =>
          import('./transaction-details/transaction-details.module').then(
            (m) => m.TransactionDetailsModule
          ),
      },
    ]),
  ],
  declarations: [TransactionsComponent],
})
export class TransactionsModule {}
