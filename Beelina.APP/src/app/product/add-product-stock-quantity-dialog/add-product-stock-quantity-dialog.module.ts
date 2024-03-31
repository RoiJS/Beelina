import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AddProductStockQuantityDialogComponent } from './add-product-stock-quantity-dialog.component';

@NgModule({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule.forChild(),
  ],
  exports: [AddProductStockQuantityDialogComponent],
  declarations: [AddProductStockQuantityDialogComponent],
})
export class AddProductStockQuantityDialogModule { }
