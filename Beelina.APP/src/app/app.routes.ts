import { Routes } from '@angular/router';

import { AuthGuard } from './_guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/product-catalogue/product-list',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'product-catalogue',
    loadChildren: () =>
      import('./product/product.module').then((m) => m.ProductModule),
    canLoad: [AuthGuard],
  },
  {
    path: 'customers',
    loadChildren: () =>
      import('./customer/customer.module').then((m) => m.CustomerModule),
    canLoad: [AuthGuard],
  },
  {
    path: 'sales',
    loadChildren: () =>
      import('./sales/sales.module').then((m) => m.SalesModule),
    canLoad: [AuthGuard],
  },
];
