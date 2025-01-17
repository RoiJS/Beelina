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
        component: PurchaseOrdersComponent
      }
    ])
  ],
  declarations: [PurchaseOrdersComponent]
})
export class PurchaseOrdersModule { }
