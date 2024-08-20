import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatRippleModule } from '@angular/material/core';

import { SettingsComponent } from './settings.component';
import { CustomUISharedModule } from '../shared/custom-ui-shared.module';

@NgModule({
  imports: [
    CustomUISharedModule,
    TranslateModule.forChild(),
    MatRippleModule,
    RouterModule.forChild([
      {
        path: '',
        component: SettingsComponent
      },
      {
        path: 'order-transactions',
        loadChildren: () => import('./order-transactions/order-transactions.module').then(m => m.OrderTransactionsModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('./report-settings/report-settings.module').then(m => m.ReportSettingsModule)
      }
    ])
  ],
  declarations: [SettingsComponent]
})
export class SettingsModule { }
