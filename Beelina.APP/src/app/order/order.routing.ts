import { Routes } from '@angular/router';

import { OrderComponent } from './order.component';

export const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'home',
  //   pathMatch: 'full',
  // },
  {
    path: '',
    component: OrderComponent,
    title: 'ORDERS_PAGE.TITLE'
  },
];
