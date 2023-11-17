import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

import { CustomUISharedModule } from '../shared/custom-ui-shared.module';
import { SalesRoutingModule } from './sales.routing.module';
import { SalesComponent } from './sales.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    SalesRoutingModule,
    TranslateModule.forChild(),
  ],
  declarations: [SalesComponent],
})
export class SalesModule {}
