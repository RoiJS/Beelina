import { NgModule } from '@angular/core';

import { ProductCartComponent } from './product-cart.component';
import { SelectNewProductComponent } from './select-new-product/select-new-product.component';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatNativeDateModule } from '@angular/material/core';

import * as ProductReducers from '../../product/store/reducers';
import * as ProductUnitReducers from '../../units/store/reducers';
import * as ProductTransactionReducers from '../add-to-cart-product/store/reducers';
import * as CustomerStoresReducers from '../../customer/store/reducers';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatIconModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatListModule,
    ReactiveFormsModule,
    ScrollingModule,
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
    TranslateModule.forChild(),
  ],
  declarations: [ProductCartComponent, SelectNewProductComponent],
})
export class ProductCartModule {}
