import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FilePickerModule } from 'ngx-awesome-uploader';

import { ProductImportComponent } from './product-import.component';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    FilePickerModule,
    MatStepperModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatTableModule,
    MatProgressBarModule,
    TranslateModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: ProductImportComponent
      }
    ])
  ],
  declarations: [ProductImportComponent]
})
export class ProductImportModule { }
