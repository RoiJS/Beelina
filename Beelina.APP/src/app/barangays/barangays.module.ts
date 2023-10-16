import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { BarangaysComponent } from './barangays.component';
import { ManageBarangayComponent } from './manage-barangay/manage-barangay.component';

import { SharedModule } from '../shared/shared.module';
import { BarangaysRoutingModule } from './barangays.routing.module';

import * as BarangaysReducers from '../barangays/store/reducers';
import { BarangaysEffects } from './store/effects';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    BarangaysRoutingModule,
    StoreModule.forFeature('barangays', BarangaysReducers.reducers),
    EffectsModule.forFeature([BarangaysEffects]),
  ],
  declarations: [BarangaysComponent, ManageBarangayComponent],
})
export class BarangaysModule {}
