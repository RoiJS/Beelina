import { Routes } from '@angular/router';

import { ProductComponent } from './product.component';
import { TopProductsComponent } from './top-products/top-products.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'product-list',
    pathMatch: 'full',
  },
  {
    path: 'product-list',
    component: ProductComponent,
    title: 'PRODUCTS_CATALOGUE_PAGE.TITLE',
  },
  {
    path: 'product-list/:transactionId',
    component: ProductComponent,
    title: 'PRODUCTS_CATALOGUE_PAGE.TITLE',
  },
  {
    path: 'text-order',
    loadChildren: () => import('./text-order/text-order.module').then(
      (m) => m.TextOrderModule
    ),
  },
  {
    path: 'text-inventories',
    loadChildren: () => import('./text-inventories/text-inventories.module').then(
      (m) => m.TextInventoriesModule
    ),
  },
  {
    path: 'add-product',
    loadChildren: () =>
      import('./add-product-details/add-product-details.module').then(
        (m) => m.AddProductDetailsModule
      ),
  },
  {
    path: 'edit-product/:id',
    loadChildren: () =>
      import('./edit-product-details/edit-product-details.module').then(
        (m) => m.EditProductDetailsModule
      ),
  },
  {
    path: 'top-products',
    component: TopProductsComponent,
    title: 'TOP_PRODUCTS_PAGE.TITLE',
  },
  {
    path: 'product-cart',
    loadChildren: () =>
      import('./product-cart/product-cart.module').then(
        (m) => m.ProductCartModule
      ),
  },
];
