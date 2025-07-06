import { Routes } from '@angular/router';
import { CustomerComponent } from './customer.component';

export const routes: Routes = [
  {
    path: '',
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
    path: ':id',
    loadChildren: () =>
      import('./edit-customer-details/edit-customer-details.module').then(
        (m) => m.EditCustomerModule
      ),
  },
  {
    path: ':storeId/transactions',
    loadChildren: () =>
      import('./store-transaction-history/store-transaction-history.module').then(
        (m) => m.StoreTransactionHistoryModule
      ),
  },
];
