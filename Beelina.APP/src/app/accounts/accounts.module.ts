import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import * as UserAccountReducers from '../accounts/store/reducers';
import { AccountsComponent } from './accounts.component';
import { UserAccountEffects } from './store/effects';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatButtonModule,
    MatListModule,
    MatRippleModule,
    MatMenuModule,
    MatIconModule,
    ScrollingModule,
    TranslateModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: AccountsComponent,
        title: 'ACCOUNTS_PAGE.TITLE'
      },
      {
        path: 'manage-user-account-details',
        loadChildren: () => import('./manage-user-account-details/manage-user-account-details.module').then(m => m.ManageUserAccountDetailsModule)
      }
    ]),
    StoreModule.forFeature('userAccounts', UserAccountReducers.reducers),
    EffectsModule.forFeature([
      UserAccountEffects,
    ]),
  ],
  declarations: [AccountsComponent]
})
export class AccountsModule { }
