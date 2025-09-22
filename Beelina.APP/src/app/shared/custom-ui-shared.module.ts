import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';

import { LongPressDirective } from '../_directives/long-press.directive';
import { TextInputAutocompleteDirective } from '../_directives/text-input-autocomplete-menu.directive';
import { SalesChartViewComponent } from '../admin-dashboard/home/sales-chart-view/sales-chart-view.component';
import { SalesPerAgentViewComponent } from '../admin-dashboard/home/sales-per-agent-view/sales-per-agent-view.component';
import { CopyProductConfirmationComponent } from '../product/copy-product-confirmation/copy-product-confirmation.component';
import { ProductCardItemComponent } from '../product/product-card-item/product-card-item.component';
import { DiscountManagementDialogComponent } from './components/discount-management-dialog/discount-management-dialog.component';
import { FilterCardComponent } from './components/filter-card/filter-card.component';
import { TextInputAutocompleteContainerComponent } from './text-input-autocomplete/text-input-autocomplete-container.component';
import { TextInputAutocompleteMenuComponent } from './text-input-autocomplete/text-input-autocomplete-menu.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { BadgeModule } from './ui/badge/badge.module';
import { BannerModule } from './ui/banner/banner.module';
import { DialogModule } from './ui/dialog/dialog.module';
import { FilterAndSortComponent } from './ui/filter-and-sort/filter-and-sort.component';
import { FloatingButtonComponent } from './ui/floating-button/floating-button.component';
import { ListContainerComponent } from './ui/list-container/list-container.component';
import { LoaderLayoutComponent } from './ui/loader-layout/loader-layout.component';
import { NotificationModule } from './ui/notification/notification.module';
import { PlaceholderEntitiesComponent } from './ui/placeholder-entities/placeholder-entities.component';
import { SearchFieldComponent } from './ui/search-field/search-field.component';
import { TransactionDateOptionMenuComponent } from './ui/transaction-date-option-menu/transaction-date-option-menu.component';
import { TransactionOptionMenuComponent } from './ui/transaction-option-menu/transaction-option-menu.component';

@NgModule({
  imports: [
    CommonModule,
    DialogModule,
    NotificationModule,
    BannerModule,
    BadgeModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDividerModule,
    MatSelectModule,
    MatListModule,
    MatDatepickerModule,
    MatMenuModule,
    MatRippleModule,
    MatTooltipModule,
    NgApexchartsModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    FilterAndSortComponent,
    FilterCardComponent,
    TransactionDateOptionMenuComponent,
    TransactionOptionMenuComponent,
    LoaderLayoutComponent,
    ListContainerComponent,
    PlaceholderEntitiesComponent,
    ToolBarComponent,
    FloatingButtonComponent,
    ProductCardItemComponent,
    SearchFieldComponent,
    TextInputAutocompleteContainerComponent,
    TextInputAutocompleteDirective,
    LongPressDirective,
    TextInputAutocompleteMenuComponent,
    SalesChartViewComponent,
    SalesPerAgentViewComponent,
    CopyProductConfirmationComponent,
    DiscountManagementDialogComponent
  ],
  exports: [
    FilterAndSortComponent,
    FilterCardComponent,
    TransactionDateOptionMenuComponent,
    TransactionOptionMenuComponent,
    LoaderLayoutComponent,
    ListContainerComponent,
    PlaceholderEntitiesComponent,
    ToolBarComponent,
    FloatingButtonComponent,
    ProductCardItemComponent,
    SearchFieldComponent,
    DialogModule,
    NotificationModule,
    BannerModule,
    BadgeModule,
    TextInputAutocompleteContainerComponent,
    TextInputAutocompleteDirective,
    LongPressDirective,
    TextInputAutocompleteMenuComponent,
    SalesChartViewComponent,
    SalesPerAgentViewComponent,
    NgApexchartsModule,
    CopyProductConfirmationComponent,
    DiscountManagementDialogComponent
  ],
})
export class CustomUISharedModule { }
