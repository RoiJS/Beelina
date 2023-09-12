import { NgModule } from '@angular/core';

import { ProductCartComponent } from './product-cart.component';
import { SelectNewProductComponent } from './select-new-product/select-new-product.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';

import * as ProductReducers from '../../product/store/reducers';
import * as ProductUnitReducers from '../../units/store/reducers';
import * as ProductTransactionReducers from '../add-to-cart-product/store/reducers';
import * as CustomerStoresReducers from '../../customer/store/reducers';


@NgModule({
  imports: [
    SharedModule,
    StoreModule.forFeature('products', ProductReducers.reducers),
    StoreModule.forFeature('productUnits', ProductUnitReducers.reducers),
    StoreModule.forFeature('customerStores', CustomerStoresReducers.reducers),
    StoreModule.forFeature(
      'productTransactions',
      ProductTransactionReducers.reducers
    ),

    RouterModule.forChild([
      {
        path: '',
        component: ProductCartComponent,
      },
      {
        path: ':id',
        component: ProductCartComponent,
      },
    ]),
  ],
  declarations: [ProductCartComponent, SelectNewProductComponent],
})
export class ProductCartModule {}
