import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

import { HomeComponent } from './home.component';
import { SubscriptionPanelComponent } from 'src/app/shared/subscription-panel/subscription-panel.component';

import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
        outlet: 'adminDashboard',
        title: 'DASHBOARD_ADMIN.HOME_PAGE.TITLE'
      }
    ])
  ],
  declarations: [HomeComponent, SubscriptionPanelComponent],
})
export class HomeModule { }
