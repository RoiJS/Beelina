import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

import { ReportDetailsComponent } from './report-details.component';
import { DateRangeControlComponent } from '../report-controls/date-range-control/date-range-control.component';
import { DatePickerComponent } from '../report-controls/date-picker/date-picker.component';
import { SortOrderControlComponent } from '../report-controls/sort-order-control/sort-order-control.component';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { SalesAgentDropdownControlComponent } from '../report-controls/sales-agent-dropdown-control/sales-agent-dropdown-control.component';
import { TransactionTypeDropdownControlComponent } from '../report-controls/transaction-type-dropdown-control/transaction-type-dropdown-control.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    RouterModule.forChild([{ path: '', component: ReportDetailsComponent }]),
    TranslateModule.forChild(),
  ],
  declarations: [
    ReportDetailsComponent,
    DateRangeControlComponent,
    DatePickerComponent,
    SortOrderControlComponent,
    SalesAgentDropdownControlComponent,
    TransactionTypeDropdownControlComponent,
  ],
})
export class ReportDetailsModule { }
