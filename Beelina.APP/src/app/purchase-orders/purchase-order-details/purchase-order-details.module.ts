import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';

import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';

import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { PurchaseOrderDetailsComponent } from './purchase-order-details.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatTableModule,
    MatPaginatorModule,
    MatExpansionModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: PurchaseOrderDetailsComponent
      }
    ]),
    TranslateModule.forChild()
  ],
  declarations: [PurchaseOrderDetailsComponent]
})
export class PurchaseOrderDetailsModule { }
