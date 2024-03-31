import { NgModule } from '@angular/core';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';

import { ProductCartComponent } from './product-cart.component';
import { SelectNewProductComponent } from './select-new-product/select-new-product.component';
import { PaymentMethodsEffects } from 'src/app/payment-methods/store/effects';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import * as CustomerStoresReducers from '../../customer/store/reducers';
import * as PaymentMethodReducers from '../../payment-methods/store/reducers';
import * as ProductReducers from '../../product/store/reducers';
import * as ProductUnitReducers from '../../units/store/reducers';
import * as ProductTransactionReducers from '../add-to-cart-product/store/reducers';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatListModule,
    ReactiveFormsModule,
    ScrollingModule,
    StoreModule.forFeature('paymentMethods', PaymentMethodReducers.reducers),
    StoreModule.forFeature('products', ProductReducers.reducers),
    StoreModule.forFeature('productUnits', ProductUnitReducers.reducers),
    StoreModule.forFeature('customerStores', CustomerStoresReducers.reducers),
    StoreModule.forFeature(
      'productTransactions',
      ProductTransactionReducers.reducers
    ),
    EffectsModule.forFeature([
      PaymentMethodsEffects,
    ]),
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
    TranslateModule.forChild(),
  ],
  declarations: [ProductCartComponent, SelectNewProductComponent],
})
export class ProductCartModule { }
