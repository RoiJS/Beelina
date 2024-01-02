import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { BadOrderDetailsComponent } from './bad-order-details.component';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatListModule,
    RouterModule.forChild([
      {
        path: '',
        component: BadOrderDetailsComponent,
        title: 'TRANSACTION_DETAILS_PAGE.TITLE',
      },
    ]),
    TranslateModule.forChild(),
  ],
  declarations: [BadOrderDetailsComponent],
})
export class BadOrderDetailsModule { }
