import { Routes } from '@angular/router';

import { AuthGuard } from './_guards/auth.guard';
import { AdminGuard } from './_guards/admin.guard';
import { AccessGuard } from './_guards/access.guard';

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
    // canActivate: [AccessGuard]
  },
  {
    path: 'warehouse-products',
    loadChildren: () =>
      import('./warehouse/warehouse.module').then((m) => m.WarehouseModule),
    canLoad: [AuthGuard],
    canActivate: [AccessGuard]
  },
  {
    path: 'accounts',
    loadChildren: () =>
      import('./accounts/accounts.module').then((m) => m.AccountsModule),
    canLoad: [AuthGuard],
    canActivate: [AccessGuard]
  },
  {
    path: 'barangays',
    loadChildren: () =>
      import('./barangays/barangays.module').then((m) => m.BarangaysModule),
    canLoad: [AuthGuard],
    canActivate: [AccessGuard]
  },
  {
    path: 'order-transactions',
    loadChildren: () =>
      import('./order-transactions/order-transactions.module').then((m) => m.OrderTransactionsModule),
    canLoad: [AuthGuard],
  },
  {
    path: 'suppliers',
    loadChildren: () =>
      import('./suppliers/suppliers.module').then((m) => m.SuppliersModule),
    canLoad: [AuthGuard],
    canActivate: [AccessGuard]
  },
  {
    path: 'sales',
    loadChildren: () =>
      import('./sales/sales.module').then((m) => m.SalesModule),
    canLoad: [AuthGuard],
    canActivate: [AccessGuard]
  },
  {
    path: 'transaction-history',
    loadChildren: () =>
      import('./transaction-history/transaction-history.module').then(
        (m) => m.TransactionHistoryModule
      ),
    canLoad: [AuthGuard],
    canActivate: [AccessGuard]
  },
  {
    path: 'draft-transactions',
    loadChildren: () =>
      import('./draft-transactions/draft-transactions.module').then(
        (m) => m.DraftTransactionsModule
      ),
    canLoad: [AuthGuard],
    canActivate: [AccessGuard]
  },
  {
    path: 'bad-orders',
    loadChildren: () =>
      import('./bad-orders/bad-orders.module').then((m) => m.BadOrdersModule),
    canLoad: [AuthGuard],
    canActivate: [AccessGuard]
  },
  {
    path: 'reports',
    loadChildren: () =>
      import('./reports/reports.module').then((m) => m.ReportsModule),
    canLoad: [AuthGuard],
    canActivate: [AccessGuard]
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfileModule),
    canLoad: [AuthGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./admin-dashboard/admin-dashoard.module').then((m) => m.AdminDashoardModule),
    canLoad: [AuthGuard, AdminGuard],
    canActivate: [AccessGuard]
  },
];
