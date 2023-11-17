import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { CustomUISharedModule } from '../shared/custom-ui-shared.module';
import { BarangaysComponent } from './barangays.component';
import { ManageBarangayComponent } from './manage-barangay/manage-barangay.component';

import { BarangaysRoutingModule } from './barangays.routing.module';

import * as BarangaysReducers from '../barangays/store/reducers';
import { BarangaysEffects } from './store/effects';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    BarangaysRoutingModule,
    MatInputModule,
    MatSnackBarModule,
    MatIconModule,
    MatBottomSheetModule,
    ReactiveFormsModule,
    MatMenuModule,
    ScrollingModule,
    StoreModule.forFeature('barangays', BarangaysReducers.reducers),
    EffectsModule.forFeature([BarangaysEffects]),
    TranslateModule.forChild(),
  ],
  declarations: [BarangaysComponent, ManageBarangayComponent],
})
export class BarangaysModule {}
