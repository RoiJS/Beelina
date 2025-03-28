import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';

import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { ProductWithdrawalDetailsComponent } from './product-withdrawal-details.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatTableModule,
    MatPaginatorModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProductWithdrawalDetailsComponent
      }
    ]),
    TranslateModule.forChild()
  ],
  declarations: [ProductWithdrawalDetailsComponent]
})
export class ProductWithdrawalDetailsModule { }
