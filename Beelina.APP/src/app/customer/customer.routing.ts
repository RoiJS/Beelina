import { Routes } from '@angular/router';
import { CustomerComponent } from './customer.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'customer-list',
    pathMatch: 'full',
  },
  {
    path: 'customer-list',
    component: CustomerComponent,
    title: 'CUSTOMERS_PAGE.TITLE'
  },
];
