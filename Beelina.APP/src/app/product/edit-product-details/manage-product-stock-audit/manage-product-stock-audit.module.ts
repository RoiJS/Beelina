import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatRippleModule } from '@angular/material/core';

import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { ManageProductStockAuditComponent } from './manage-product-stock-audit.component';
import * as ProductStockAuditReducers from './store/reducers';
import { ProductStockAuditEffects } from './store/effects';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatRippleModule,
    ScrollingModule,
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
