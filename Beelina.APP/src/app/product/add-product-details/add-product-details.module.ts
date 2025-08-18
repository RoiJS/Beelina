import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { AddProductStockQuantityDialogModule } from '../add-product-stock-quantity-dialog/add-product-stock-quantity-dialog.module';
import { AddProductDetailsComponent } from './add-product-details.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatRippleModule,
    MatBottomSheetModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    AddProductStockQuantityDialogModule,
    RouterModule.forChild([
      {
        path: '',
        component: AddProductDetailsComponent,
        title: 'ADD_PRODUCT_DETAILS_PAGE.TITLE',
      },
    ]),
    TranslateModule.forChild(),
  ],
  declarations: [AddProductDetailsComponent],
})
export class AddProductDetailsModule { }
