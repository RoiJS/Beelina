import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { AddProductStockQuantityDialogModule } from '../add-product-stock-quantity-dialog/add-product-stock-quantity-dialog.module';
import { SalesAgentSelectorDialogModule } from 'src/app/shared/components/sales-agent-selector-dialog';
import { EditProductDetailsComponent } from './edit-product-details.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatBottomSheetModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatTabsModule,
    MatMenuModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    AddProductStockQuantityDialogModule,
    SalesAgentSelectorDialogModule,
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
