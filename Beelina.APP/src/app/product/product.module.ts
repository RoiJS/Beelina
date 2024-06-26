import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { CustomUISharedModule } from '../shared/custom-ui-shared.module';
import { ProductRoutingModule } from './product.routing.module';
import { AddToCartProductComponent } from './add-to-cart-product/add-to-cart-product.component';
import { ProductComponent } from './product.component';
import { ProductFilterComponent } from './product-filter/product-filter.component';
import { TopProductsComponent } from './top-products/top-products.component';
import { TransferProductInventoryComponent } from './transfer-product-inventory/transfer-product-inventory.component';

import * as BarangayReducers from '../barangays/store/reducers';
import * as CustomerStoresReducers from '../customer/store/reducers';
import * as ProductReducers from '../product/store/reducers';
import * as ProductUnitReducers from '../units/store/reducers';
import * as ProductTransactionReducers from './add-to-cart-product/store/reducers';
import * as TopSellingProductReducers from './top-products/store/reducers';

import { BarangaysEffects } from '../barangays/store/effects';
import { CustomerEffects } from '../customer/store/effects';
import { ProductEffects } from './store/effects';
import { ProductUnitEffects } from '../units/store/effects';
import { ProductTransactionsEffects } from './add-to-cart-product/store/effects';

import { CartGuard } from '../_guards/cart.guard';
import { AccountVerificationModule } from '../shared/account-verification/account-verification.module';
import { TopSellingProductEffects } from './top-products/store/effects';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CustomUISharedModule,
    ScrollingModule,
    ProductRoutingModule,
    AccountVerificationModule,
    MatBadgeModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatRippleModule,
    MatBottomSheetModule,
    MatSelectModule,
    MatNativeDateModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    StoreModule.forFeature('barangays', BarangayReducers.reducers),
    StoreModule.forFeature('products', ProductReducers.reducers),
    StoreModule.forFeature('productUnits', ProductUnitReducers.reducers),
    StoreModule.forFeature('customerStores', CustomerStoresReducers.reducers),
    StoreModule.forFeature('topSellingProducts', TopSellingProductReducers.reducers),
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
      TopSellingProductEffects,
    ]),
    TranslateModule.forChild(),
  ],
  declarations: [
    ProductComponent,
    ProductFilterComponent,
    TopProductsComponent,
    AddToCartProductComponent,
    TransferProductInventoryComponent
  ],
  providers: [CartGuard],
})
export class ProductModule { }
