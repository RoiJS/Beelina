import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import * as ProductTransactionReducers from '../../product/add-to-cart-product/store/reducers';
import * as ProductStockAuditReducers from '../../product/edit-product-details/manage-product-stock-audit/store/reducers';
import * as ProductReducers from '../../product/store/reducers';

import { ProductTransactionsEffects } from 'src/app/product/add-to-cart-product/store/effects';
import { ProductStockAuditEffects } from 'src/app/product/edit-product-details/manage-product-stock-audit/store/effects';
import { ProductEffects } from 'src/app/product/store/effects';

import { DistributionComponent } from './distribution.component';
import { SalesAgentListComponent } from './sales-agent-list/sales-agent-list.component';
import { StoreListBottomSheetComponent } from './sales-agent-list/store-list-bottom-sheet/store-list-bottom-sheet.component';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { DialogModule } from 'src/app/shared/ui/dialog/dialog.module';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductStockAuditComponent } from './product-stock-audit/product-stock-audit.component';
import { SalesInformationComponent } from './sales-information/sales-information.component';
import { SalesTargetDialogComponent } from './sales-target-management/sales-target-dialog/sales-target-dialog.component';
import { SalesTargetManagementComponent } from './sales-target-management/sales-target-management.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    DialogModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBottomSheetModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatDialogModule,
    ScrollingModule,
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
    StoreListBottomSheetComponent,
    SalesInformationComponent,
    SalesTargetManagementComponent,
    SalesTargetDialogComponent,
    ProductListComponent,
    ProductStockAuditComponent
  ]
})
export class DistributionModule { }
