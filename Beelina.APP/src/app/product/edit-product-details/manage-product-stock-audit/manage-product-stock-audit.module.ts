import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { ManageProductStockAuditComponent } from './manage-product-stock-audit.component';
import { ProductStockAuditEffects } from './store/effects';
import * as ProductStockAuditReducers from './store/reducers';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatRippleModule,
    ScrollingModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBottomSheetModule,
    StoreModule.forFeature('productStockAudits', ProductStockAuditReducers.reducers),
    EffectsModule.forFeature([ProductStockAuditEffects]),
    RouterModule.forChild([
      {
        path: '',
        component: ManageProductStockAuditComponent
      }
    ]),
    TranslateModule.forChild()
  ],
  declarations: [ManageProductStockAuditComponent]
})
export class ManageProductStockAuditModule { }
