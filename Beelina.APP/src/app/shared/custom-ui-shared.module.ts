import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslateModule } from '@ngx-translate/core';

import { ProductCardItemComponent } from '../product/product-card-item/product-card-item.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { DialogModule } from './ui/dialog/dialog.module';
import { EmptyEntitiesPlaceholderComponent } from './ui/empty-entities-placeholder/empty-entities-placeholder.component';
import { FilterAndSortComponent } from './ui/filter-and-sort/filter-and-sort.component';
import { FloatingButtonComponent } from './ui/floating-button/floating-button.component';
import { ListContainerComponent } from './ui/list-container/list-container.component';
import { LoaderLayoutComponent } from './ui/loader-layout/loader-layout.component';
import { SearchFieldComponent } from './ui/search-field/search-field.component';

@NgModule({
  imports: [
    CommonModule,
    DialogModule,
    MatBadgeModule,
    MatIconModule,
    MatToolbarModule,
    MatDividerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatMenuModule,
    MatRippleModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    FilterAndSortComponent,
    LoaderLayoutComponent,
    ListContainerComponent,
    EmptyEntitiesPlaceholderComponent,
    ToolBarComponent,
    FloatingButtonComponent,
    ProductCardItemComponent,
    SearchFieldComponent,
  ],
  exports: [
    FilterAndSortComponent,
    LoaderLayoutComponent,
    ListContainerComponent,
    EmptyEntitiesPlaceholderComponent,
    ToolBarComponent,
    FloatingButtonComponent,
    ProductCardItemComponent,
    SearchFieldComponent,
    DialogModule,
  ],
})
export class CustomUISharedModule {}
