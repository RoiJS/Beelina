import { Routes } from '@angular/router';

import { ReportsComponent } from './reports.component';

export const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    title: 'REPORTS_PAGE.TITLE',
  },
  {
    path: ':id',
    loadChildren: () =>
      import('./report-details/report-details.module').then(
        (m) => m.ReportDetailsModule
      ),
  },
];
