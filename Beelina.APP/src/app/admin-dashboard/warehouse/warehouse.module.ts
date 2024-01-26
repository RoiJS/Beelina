import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { WarehouseComponent } from './warehouse.component';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    TranslateModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: WarehouseComponent,
        outlet: 'adminDashboard'
      }
    ])
  ],
  declarations: [WarehouseComponent]
})
export class WarehouseModule { }
