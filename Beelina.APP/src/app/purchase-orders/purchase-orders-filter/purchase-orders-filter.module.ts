import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';

import { PurchaseOrdersFilterComponent } from './purchase-orders-filter.component';

@NgModule({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule.forChild(),
  ],
  exports: [PurchaseOrdersFilterComponent],
  declarations: [PurchaseOrdersFilterComponent]
})
export class PurchaseOrdersFilterModule { }
