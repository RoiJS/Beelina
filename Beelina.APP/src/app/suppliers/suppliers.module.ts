import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';

import { CustomUISharedModule } from '../shared/custom-ui-shared.module';
import { ManageSupplierComponent } from './manage-supplier/manage-supplier.component';
import { SuppliersComponent } from './suppliers.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatInputModule,
    MatIconModule,
    MatRippleModule,
    MatBottomSheetModule,
    ReactiveFormsModule,
    MatMenuModule,
    ScrollingModule,
    RouterModule.forChild([
      {
        path: '',
        component: SuppliersComponent
      }
    ]),
    TranslateModule.forChild(),
  ],
  declarations: [SuppliersComponent, ManageSupplierComponent],
})
export class SuppliersModule { }
