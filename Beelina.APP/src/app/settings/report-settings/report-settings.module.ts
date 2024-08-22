import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';

import { ReportSettingsComponent } from './report-settings.component';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CustomUISharedModule,
    MatInputModule,
    RouterModule.forChild([
      {
        path: '',
        component: ReportSettingsComponent
      }
    ]),
    ReactiveFormsModule,
    TranslateModule.forChild()
  ],
  declarations: [ReportSettingsComponent]
})
export class ReportSettingsModule { }
