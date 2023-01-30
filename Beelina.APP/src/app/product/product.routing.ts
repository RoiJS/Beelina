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
    title: 'PRODUCTS_PAGE.TITLE'
  },
  {
    path: 'top-products',
    component: TopProductsComponent,
    title: 'TOP_PRODUCTS_PAGE.TITLE'
  },
];
