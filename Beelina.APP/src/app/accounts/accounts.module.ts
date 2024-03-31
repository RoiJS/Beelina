import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AccountsComponent } from './accounts.component';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    TranslateModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: AccountsComponent,
        title: 'DASHBOARD_ADMIN.WAREHOUSE_PAGE.TITLE'
      }
    ])
  ],
  declarations: [AccountsComponent]
})
export class AccountsModule { }
