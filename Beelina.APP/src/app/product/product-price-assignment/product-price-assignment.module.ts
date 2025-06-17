import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';

import { CustomUISharedModule } from '../../shared/custom-ui-shared.module';
import { ProductPriceAssignmentComponent } from './product-price-assignment.component';
import { ProductPriceAssignmentRoutingModule } from './product-price-assignment.routing.module';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    RouterModule,
    TranslateModule.forChild(),
    ProductPriceAssignmentRoutingModule
  ],
  declarations: [ProductPriceAssignmentComponent],
  exports: [ProductPriceAssignmentComponent]
})
export class ProductPriceAssignmentModule { }
