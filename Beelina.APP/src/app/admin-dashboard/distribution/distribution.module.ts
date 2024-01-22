import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

import * as ProductReducers from '../../product/store/reducers';
import * as ProductTransactionReducers from '../../product/add-to-cart-product/store/reducers';
import * as ProductStockAuditReducers from '../../product/edit-product-details/manage-product-stock-audit/store/reducers';

import { ProductEffects } from 'src/app/product/store/effects';
import { ProductStockAuditEffects } from 'src/app/product/edit-product-details/manage-product-stock-audit/store/effects';
import { ProductTransactionsEffects } from 'src/app/product/add-to-cart-product/store/effects';

import { DistributionComponent } from './distribution.component';
import { SalesAgentListComponent } from './sales-agent-list/sales-agent-list.component';

import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { SalesInformationComponent } from './sales-information/sales-information.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductStockAuditComponent } from './product-stock-audit/product-stock-audit.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatListModule,
    ScrollingModule,
    MatRippleModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBottomSheetModule,
    MatTabsModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    StoreModule.forFeature('products', ProductReducers.reducers),
    StoreModule.forFeature('productStockAudits', ProductStockAuditReducers.reducers),
    StoreModule.forFeature(
      'productTransactions',
      ProductTransactionReducers.reducers
    ),
    EffectsModule.forFeature([
      ProductEffects,
      ProductTransactionsEffects,
      ProductStockAuditEffects
    ]),
    RouterModule.forChild([
      {
        path: '',
        component: DistributionComponent,
        outlet: 'adminDashboard',
        title: 'DASHBOARD_ADMIN.HOME_PAGE.TITLE'
      }
    ])
  ],
  declarations: [
    DistributionComponent,
    SalesAgentListComponent,
    SalesInformationComponent,
    ProductListComponent,
    ProductStockAuditComponent
  ]
})
export class DistributionModule { }
