import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTreeModule } from '@angular/material/tree';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';

import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatTreeModule,
    MatCardModule,
    MatGridListModule,
    MatExpansionModule,
    MatTableModule,
    MatInputModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
  ],
  declarations: [SafeHtmlPipe, ToolBarComponent],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatTreeModule,
    MatCardModule,
    MatGridListModule,
    MatExpansionModule,
    MatTableModule,
    MatInputModule,
    ReactiveFormsModule,
    SafeHtmlPipe,
    ToolBarComponent,
  ],
})
export class SharedModule {}
