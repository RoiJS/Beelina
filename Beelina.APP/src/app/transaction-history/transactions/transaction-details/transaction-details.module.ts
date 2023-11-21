import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { TransactionDetailsComponent } from './transaction-details.component';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatListModule,
    MatSnackBarModule,
    RouterModule.forChild([
      {
        path: '',
        component: TransactionDetailsComponent,
        title: 'TRANSACTION_DETAILS_PAGE.TITLE',
      },
    ]),
    TranslateModule.forChild(),
  ],
  declarations: [TransactionDetailsComponent],
})
export class TransactionDetailsModule {}
