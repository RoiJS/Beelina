import { NgModule } from '@angular/core';

import { TransactionHistoryComponent } from './transaction-history.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    SharedModule,
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
  ],
  declarations: [TransactionHistoryComponent],
})
export class TransactionHistoryModule {}
