import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ReportsComponent } from './reports.component';
import { ReportSettingsComponent } from './report-settings/report-settings.component';

import { ReportsRoutingModule } from './reports.routing.module';
import { CustomUISharedModule } from '../shared/custom-ui-shared.module';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatIconModule,
    MatRippleModule,
    MatInputModule,
    MatBottomSheetModule,
    MatSnackBarModule,
    ReportsRoutingModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
  ],
  declarations: [ReportsComponent, ReportSettingsComponent],
})
export class ReportsModule { }
