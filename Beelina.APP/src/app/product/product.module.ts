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
import { MatRippleModule } from '@angular/material/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';

import { CustomUISharedModule } from '../shared/custom-ui-shared.module';
import { ProductRoutingModule } from './product.routing.module';
import { ProductComponent } from './product.component';
import { TopProductsComponent } from './top-products/top-products.component';
import { AddToCartProductComponent } from './add-to-cart-product/add-to-cart-product.component';
import { TextInputAutocompleteContainerComponent } from '../shared/text-input-autocomplete/text-input-autocomplete-container.component';
import { TextInputAutocompleteMenuComponent } from '../shared/text-input-autocomplete/text-input-autocomplete-menu.component';
import { TransferProductInventoryComponent } from './transfer-product-inventory/transfer-product-inventory.component';

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
import { AccountVerificationModule } from '../shared/account-verification/account-verification.module';

import { TextInputAutocompleteDirective } from '../_directives/text-input-autocomplete-menu.directive';
import { TextInventoriesComponent } from './text-inventories/text-inventories.component';

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
    MatSnackBarModule,
    MatSelectModule,
    ReactiveFormsModule,
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
    TranslateModule.forChild(),
  ],
  declarations: [
    ProductComponent,
    TopProductsComponent,
    AddToCartProductComponent,
    TextOrderComponent,
    TextInventoriesComponent,
    TransferProductInventoryComponent,
    TextInputAutocompleteContainerComponent,
    TextInputAutocompleteDirective,
    TextInputAutocompleteMenuComponent
  ],
  providers: [CartGuard, TextInputAutocompleteDirective,],
})
export class ProductModule { }
