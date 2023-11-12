import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { LayoutModule } from '@angular/cdk/layout';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';

import { DialogModule } from './ui/dialog/dialog.module';

import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { EmptyEntitiesPlaceholderComponent } from './ui/empty-entities-placeholder/empty-entities-placeholder.component';
import { FilterAndSortComponent } from './ui/filter-and-sort/filter-and-sort.component';
import { FloatingButtonComponent } from './ui/floating-button/floating-button.component';
import { ListContainerComponent } from './ui/list-container/list-container.component';
import { LoaderLayoutComponent } from './ui/loader-layout/loader-layout.component';

import { SafeHtmlPipe } from '../pipes/safe-html.pipe';
import { SearchFieldComponent } from './ui/search-field/search-field.component';
import { ProductCardItemComponent } from '../product/product-card-item/product-card-item.component';

@NgModule({
  imports: [
    CommonModule,
    DialogModule,
    RouterModule,
    FormsModule,
    LayoutModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatToolbarModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBadgeModule,
    MatSidenavModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatTreeModule,
    MatCardModule,
    MatGridListModule,
    MatExpansionModule,
    MatBottomSheetModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatMenuModule,
    MatRippleModule,
    ReactiveFormsModule,
    ScrollingModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    SafeHtmlPipe,
    ToolBarComponent,
    LoaderLayoutComponent,
    FloatingButtonComponent,
    EmptyEntitiesPlaceholderComponent,
    ListContainerComponent,
    FilterAndSortComponent,
    SearchFieldComponent,
    ProductCardItemComponent,
  ],
  exports: [
    CommonModule,
    DialogModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    LayoutModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatToolbarModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBadgeModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatTreeModule,
    MatCardModule,
    MatGridListModule,
    MatExpansionModule,
    MatBottomSheetModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatRippleModule,
    SafeHtmlPipe,
    ScrollingModule,
    ToolBarComponent,
    LoaderLayoutComponent,
    FloatingButtonComponent,
    EmptyEntitiesPlaceholderComponent,
    ListContainerComponent,
    FilterAndSortComponent,
    SearchFieldComponent,
    ProductCardItemComponent,
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 5000 } },
  ],
})
export class SharedModule {}
