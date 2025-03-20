import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { CustomUISharedModule } from '../shared/custom-ui-shared.module';
import { PurchaseOrdersFilterModule } from './purchase-orders-filter/purchase-orders-filter.module';
import { PurchaseOrdersComponent } from './purchase-orders.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    PurchaseOrdersFilterModule,
    TranslateModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: PurchaseOrdersComponent,
        title: 'PURCHASE_ORDERS_PAGE.TITLE',
      },
      {
        path: 'add',
        loadChildren: () => import('./purchase-order-details/purchase-order-details.module').then(m => m.PurchaseOrderDetailsModule),
        title: 'PURCHASE_ORDER_DETAILS_PAGE.TITLE',
      },
      {
        path: ':id',
        loadChildren: () => import('./purchase-order-details/purchase-order-details.module').then(m => m.PurchaseOrderDetailsModule),
        title: 'PURCHASE_ORDER_DETAILS_PAGE.TITLE',
      }
    ])
  ],
  declarations: [PurchaseOrdersComponent]
})
export class PurchaseOrdersModule { }
