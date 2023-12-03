import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { RouterModule } from '@angular/router';

import { AddProductDetailsComponent } from './add-product-details.component';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { WithdrawalSlipNoDialogModule } from '../withdrawal-slip-no-dialog/withdrawal-slip-no-dialog.module';
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
    ReactiveFormsModule,
    WithdrawalSlipNoDialogModule,
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
