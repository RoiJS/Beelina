import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TranslateModule } from '@ngx-translate/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { DraftTransactionComponent } from './draft-transaction.component';
import { ConfirmOrdersDialogComponent } from '../confirm-orders-dialog/confirm-orders-dialog.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CustomUISharedModule,
    FormsModule,
    MatCheckboxModule,
    MatIconModule,
    MatRippleModule,
    MatMenuModule,
    MatSlideToggleModule,
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
  declarations: [
    DraftTransactionComponent,
    ConfirmOrdersDialogComponent
  ],
})
export class DraftTransactionModule { }
