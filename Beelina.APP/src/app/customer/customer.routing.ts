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
    title: 'CUSTOMERS_PAGE.TITLE',
  },
  {
    path: 'add-customer',
    loadChildren: () =>
      import('./add-customer-details/add-customer-details.module').then(
        (m) => m.AddCustomerDetailsModule
      ),
  },
  {
    path: 'edit-customer/:id',
    loadChildren: () =>
      import('./edit-customer-details/edit-customer-details.module').then(
        (m) => m.EditCustomerModule
      ),
  },
];
