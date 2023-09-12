import { NgModule } from '@angular/core';

import { DraftTransactionComponent } from './draft-transaction.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: DraftTransactionComponent,
        title: 'DRAFT_TRANSACTIONS_PAGE.TITLE',
      },
    ]),
  ],
  declarations: [DraftTransactionComponent],
})
export class DraftTransactionModule {}
