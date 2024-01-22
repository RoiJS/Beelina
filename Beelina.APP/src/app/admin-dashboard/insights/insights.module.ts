import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

import * as TopSellingProductReducers from '../../product/top-products/store/reducers';
import { InsightsComponent } from './insights.component';

import { TopSellingProductEffects } from 'src/app/product/top-products/store/effects';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { TopSellingProductsChartComponent } from './top-selling-products-chart/top-selling-products-chart.component';
import { TopSellingProductsListComponent } from './top-selling-products-list/top-selling-products-list.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    ScrollingModule,
    MatBottomSheetModule,
    MatNativeDateModule,
    MatDatepickerModule,
    StoreModule.forFeature('topSellingProducts', TopSellingProductReducers.reducers),
    EffectsModule.forFeature([
      TopSellingProductEffects,
    ]),
    TranslateModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: InsightsComponent,
        outlet: 'adminDashboard'
      }
    ])
  ],
  declarations: [
    InsightsComponent,
    TopSellingProductsChartComponent,
    TopSellingProductsListComponent
  ]
})
export class InsightsModule { }
