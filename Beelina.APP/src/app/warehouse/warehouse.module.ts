import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatListModule } from '@angular/material/list';
import { EffectsModule } from '@ngrx/effects';

import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { WarehouseProductEffects } from './store/effects';
import * as WarehouseProductReducers from './store/reducers';
import { WarehouseComponent } from './warehouse.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatBottomSheetModule,
    MatListModule,
    ScrollingModule,
    TranslateModule.forChild(),
    StoreModule.forFeature('warehouseProducts', WarehouseProductReducers.reducers),
    EffectsModule.forFeature([
      WarehouseProductEffects,
    ]),
    RouterModule.forChild([
      {
        path: '',
        component: WarehouseComponent,
        title: 'WAREHOUSE_PAGE.TITLE'
      },
      {
        path: 'product-import',
        loadChildren: () => import('./product-import/product-import.module').then(p => p.ProductImportModule)
      }
    ])
  ],
  declarations: [WarehouseComponent]
})
export class WarehouseModule { }
