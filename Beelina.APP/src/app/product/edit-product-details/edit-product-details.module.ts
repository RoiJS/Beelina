import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';

import { EditProductDetailsComponent } from './edit-product-details.component';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { WithdrawalSlipNoDialogModule } from '../withdrawal-slip-no-dialog/withdrawal-slip-no-dialog.module';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    WithdrawalSlipNoDialogModule,
    RouterModule.forChild([
      {
        path: '',
        component: EditProductDetailsComponent,
        title: 'EDIT_PRODUCT_DETAILS_PAGE.TITLE',
      },
      {
        path: 'manage-product-stock-audit',
        loadChildren: () => import('./manage-product-stock-audit/manage-product-stock-audit.module').then((m) => m.ManageProductStockAuditModule),
      }
    ]),
    TranslateModule.forChild(),
  ],
  declarations: [EditProductDetailsComponent],
})
export class EditProductDetailsModule { }
