import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { CustomUISharedModule } from '../shared/custom-ui-shared.module';
import { ProductWithdrawalFilterModule } from './product-withdrawal-filter/product-withdrawal-filter.module';
import { ProductWithdrawalsComponent } from './product-withdrawals.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    ProductWithdrawalFilterModule,
    TranslateModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: ProductWithdrawalsComponent,
        title: 'PRODUCT_WITHDRAWALS_PAGE.TITLE',
      },
      {
        path: 'add',
        loadChildren: () => import('./product-withdrawal-details/product-withdrawal-details.module').then(m => m.ProductWithdrawalDetailsModule),
        title: 'PURCHASE_ORDER_DETAILS_PAGE.TITLE',
      },
      {
        path: ':id',
        loadChildren: () => import('./product-withdrawal-details/product-withdrawal-details.module').then(m => m.ProductWithdrawalDetailsModule),
        title: 'PURCHASE_ORDER_DETAILS_PAGE.TITLE',
      }
    ])
  ],
  declarations: [ProductWithdrawalsComponent]
})
export class ProductWithdrawalsModule { }
