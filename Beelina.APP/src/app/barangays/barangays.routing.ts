import { Routes } from '@angular/router';

import { BarangaysComponent } from './barangays.component';

export const routes: Routes = [
  {
    path: '',
    component: BarangaysComponent,
    title: 'CUSTOMER_ACCOUNTS_PAGE.TITLE',
  },
  {
    path: ':barangay',
    loadChildren: () =>
      import('../customer/customer.module').then((m) => m.CustomerModule),
  },
];
