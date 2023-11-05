import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { ReportDetailsComponent } from './report-details.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([{ path: '', component: ReportDetailsComponent }]),
  ],
  declarations: [ReportDetailsComponent],
})
export class ReportDetailsModule {}
