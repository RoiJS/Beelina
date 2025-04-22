import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashoardComponent } from './admin-dashoard.component';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { CustomUISharedModule } from '../shared/custom-ui-shared.module';
import { ScreenNotSupportedComponent } from './screen-not-supported/screen-not-supported.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    TranslateModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: AdminDashoardComponent,
        title: 'DASHBOARD_ADMIN.TITLE',
        children: [
          {
            path: '',
            loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
          },
          {
            path: 'distribution',
            loadChildren: () => import('./distribution/distribution.module').then(m => m.DistributionModule),
          },
          {
            path: 'insights',
            loadChildren: () => import('./insights/insights.module').then(m => m.InsightsModule),
          }
        ]
      },
    ])
  ],
  declarations: [AdminDashoardComponent, ScreenNotSupportedComponent]
})
export class AdminDashoardModule { }
