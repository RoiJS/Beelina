import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';


import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

import { ProductEffects } from '../store/effects';

import * as ProductReducers from '../../product/store/reducers';
import * as ProductTransactionReducers from '../add-to-cart-product/store/reducers';

import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { ProductTransactionsEffects } from '../add-to-cart-product/store/effects';
import { TextOrderComponent } from './text-order.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    MatIconModule,
    MatInputModule,
    RouterModule.forChild([
      {
        path: '',
        component: TextOrderComponent
      }
    ]),
    StoreModule.forFeature('products', ProductReducers.reducers),
    StoreModule.forFeature(
      'productTransactions',
      ProductTransactionReducers.reducers
    ),
    EffectsModule.forFeature([
      ProductEffects,
      ProductTransactionsEffects,
    ]),
  ],
  declarations: [
    TextOrderComponent,
  ],
})
export class TextOrderModule { }
