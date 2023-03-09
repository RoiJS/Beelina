import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TransactionDetailsComponent } from './transaction-details.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: TransactionDetailsComponent,
        title: 'TRANSACTION_DETAILS_PAGE.TITLE',
      },
    ]),
  ],
  declarations: [TransactionDetailsComponent],
})
export class TransactionDetailsModule {}
