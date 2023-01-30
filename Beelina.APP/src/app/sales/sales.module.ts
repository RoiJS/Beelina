import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { SalesComponent } from './sales.component';
import { SalesRoutingModule } from './sales.routing.module';


@NgModule({
  imports: [SharedModule, SalesRoutingModule],
  declarations: [SalesComponent],
})
export class SalesModule {}
