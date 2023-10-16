import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { routes } from './barangays.routing';

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BarangaysRoutingModule {}
