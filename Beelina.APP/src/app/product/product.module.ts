import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { ProductRoutingModule } from './product.routing.module';
import { SharedModule } from '../shared/shared.module';

import { ProductComponent } from './product.component';
import { TopProductsComponent } from './top-products/top-products.component';
import { AddToCartProductComponent } from './add-to-cart-product/add-to-cart-product.component';

import * as ProductReducers from '../product/store/reducers';
import * as ProductUnitReducers from '../units/store/reducers';
import * as ProductTransactionReducers from './add-to-cart-product/store/reducers';
import * as CustomerStoresReducers from '../customer/store/reducers';

import { ProductEffects } from './store/effects';
import { ProductUnitEffects } from '../units/store/effects';
import { CustomerEffects } from '../customer/store/effects';
import { CartGuard } from '../_guards/cart.guard';

@NgModule({
  imports: [
    SharedModule,
    ProductRoutingModule,
    StoreModule.forFeature('products', ProductReducers.reducers),
    StoreModule.forFeature('productUnits', ProductUnitReducers.reducers),
    StoreModule.forFeature('customerStores', CustomerStoresReducers.reducers),
    StoreModule.forFeature(
      'productTransactions',
      ProductTransactionReducers.reducers
    ),
    EffectsModule.forFeature([
      ProductEffects,
      ProductUnitEffects,
      CustomerEffects,
    ]),
  ],
  declarations: [
    ProductComponent,
    TopProductsComponent,
    AddToCartProductComponent,
  ],
  providers: [CartGuard],
})
export class ProductModule {}
