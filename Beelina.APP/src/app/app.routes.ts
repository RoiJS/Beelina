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
    path: 'barangays',
    loadChildren: () =>
      import('./barangays/barangays.module').then((m) => m.BarangaysModule),
    canLoad: [AuthGuard],
  },
  {
    path: 'sales',
    loadChildren: () =>
      import('./sales/sales.module').then((m) => m.SalesModule),
    canLoad: [AuthGuard],
  },
  {
    path: 'transaction-history',
    loadChildren: () =>
      import('./transaction-history/transaction-history.module').then(
        (m) => m.TransactionHistoryModule
      ),
    canLoad: [AuthGuard],
  },
  {
    path: 'draft-transactions',
    loadChildren: () =>
      import('./draft-transactions/draft-transactions.module').then(
        (m) => m.DraftTransactionsModule
      ),
    canLoad: [AuthGuard],
  },
];
