import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { LayoutModule } from '@angular/cdk/layout';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTreeModule } from '@angular/material/tree';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { DialogModule } from './ui/dialog/dialog.module';

import { EmptyEntitiesPlaceholderComponent } from './ui/empty-entities-placeholder/empty-entities-placeholder.component';
import { LoaderLayoutComponent } from './ui/loader-layout/loader-layout.component';
import { ListContainerComponent } from './ui/list-container/list-container.component';
import { FloatingButtonComponent } from './ui/floating-button/floating-button.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';

import { SafeHtmlPipe } from '../pipes/safe-html.pipe';

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
    ListContainerComponent
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
    ListContainerComponent
  ],
})
export class SharedModule {}
