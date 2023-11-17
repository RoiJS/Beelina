import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TranslateModule } from '@ngx-translate/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

import { DraftTransactionComponent } from './draft-transaction.component';
@NgModule({
  imports: [
    CustomUISharedModule,
    MatIconModule,
    ScrollingModule,
    MatBottomSheetModule,
    RouterModule.forChild([
      {
        path: '',
        component: DraftTransactionComponent,
        title: 'DRAFT_TRANSACTIONS_PAGE.TITLE',
      },
    ]),
    TranslateModule.forChild(),
  ],
  declarations: [DraftTransactionComponent],
})
export class DraftTransactionModule {}
