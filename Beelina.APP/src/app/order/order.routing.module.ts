import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { routes } from './order.routing';

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
