import { Routes } from '@angular/router';

import { BarangaysComponent } from './barangays.component';

export const routes: Routes = [
  {
    path: '',
    component: BarangaysComponent,
    title: 'BARANGAYS_PAGE.TITLE',
  },
  {
    path: ':barangay',
    loadChildren: () =>
      import('../customer/customer.module').then((m) => m.CustomerModule),
  },
];
