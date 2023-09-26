import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { ProductRoutingModule } from './product.routing.module';
import { SharedModule } from '../shared/shared.module';

import { ProductComponent } from './product.component';
import { TopProductsComponent } from './top-products/top-products.component';
import { AddToCartProductComponent } from './add-to-cart-product/add-to-cart-product.component';

import * as BarangayReducers from '../barangays/store/reducers';
import * as CustomerStoresReducers from '../customer/store/reducers';
import * as ProductReducers from '../product/store/reducers';
import * as ProductUnitReducers from '../units/store/reducers';
import * as ProductTransactionReducers from './add-to-cart-product/store/reducers';

import { BarangaysEffects } from '../barangays/store/effects';
import { CustomerEffects } from '../customer/store/effects';
import { ProductEffects } from './store/effects';
import { ProductUnitEffects } from '../units/store/effects';
import { ProductTransactionsEffects } from './add-to-cart-product/store/effects';

import { CartGuard } from '../_guards/cart.guard';
import { TextOrderComponent } from './text-order/text-order.component';

@NgModule({
  imports: [
    SharedModule,
    ProductRoutingModule,
    StoreModule.forFeature('barangays', BarangayReducers.reducers),
    StoreModule.forFeature('products', ProductReducers.reducers),
    StoreModule.forFeature('productUnits', ProductUnitReducers.reducers),
    StoreModule.forFeature('customerStores', CustomerStoresReducers.reducers),
    StoreModule.forFeature(
      'productTransactions',
      ProductTransactionReducers.reducers
    ),
    EffectsModule.forFeature([
      BarangaysEffects,
      ProductEffects,
      ProductUnitEffects,
      CustomerEffects,
      ProductTransactionsEffects,
    ]),
  ],
  declarations: [
    ProductComponent,
    TopProductsComponent,
    AddToCartProductComponent,
    TextOrderComponent,
  ],
  providers: [CartGuard],
})
export class ProductModule {}
