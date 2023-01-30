import { NgModule } from '@angular/core';

import { OrderComponent } from './order.component';
import { OrderRoutingModule } from './order.routing.module';

import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [SharedModule, OrderRoutingModule],
  declarations: [OrderComponent],
})
export class OrderModule {}
