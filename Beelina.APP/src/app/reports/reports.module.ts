import { NgModule } from '@angular/core';

import { ReportsComponent } from './reports.component';
import { SharedModule } from '../shared/shared.module';
import { ReportsRoutingModule } from './reports.routing.module';
import { DateRangeControlComponent } from './report-controls/date-range-control/date-range-control.component';
import { SortOrderControlComponent } from './report-controls/sort-order-control/sort-order-control.component';
import { DatePickerComponent } from './report-controls/date-picker/date-picker.component';

@NgModule({
  imports: [SharedModule, ReportsRoutingModule],
  declarations: [
    ReportsComponent,
    DateRangeControlComponent,
    DatePickerComponent,
    SortOrderControlComponent,
  ],
})
export class ReportsModule {}
