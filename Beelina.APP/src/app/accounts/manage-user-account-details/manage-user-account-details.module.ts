import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

import { ManageUserAccountDetailsComponent } from './manage-user-account-details.component';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    TranslateModule.forChild(),
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ManageUserAccountDetailsComponent,
        title: 'MANAGE_ACCOUNT_PAGE.TITLE'
      },
      {
        path: ':id',
        component: ManageUserAccountDetailsComponent,
        title: 'MANAGE_ACCOUNT_PAGE.TITLE'
      }
    ])
  ],
  declarations: [ManageUserAccountDetailsComponent]
})
export class ManageUserAccountDetailsModule { }
