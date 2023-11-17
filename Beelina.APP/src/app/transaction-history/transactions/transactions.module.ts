import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { TransactionsComponent } from './transactions.component';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatIconModule,
    ScrollingModule,
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
    TranslateModule.forChild(),
  ],
  declarations: [TransactionsComponent],
})
export class TransactionsModule {}
