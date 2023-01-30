import { NgModule } from '@angular/core';

import { CustomerComponent } from './customer.component';
import { CustomerRoutingModule } from './customer.routing.module';

import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [SharedModule, CustomerRoutingModule],
  declarations: [CustomerComponent],
})
export class CustomerModule {}
