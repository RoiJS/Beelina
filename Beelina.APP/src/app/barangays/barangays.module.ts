import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { MatRippleModule } from '@angular/material/core';

import { ApplySubscriptionDialogModule } from '../shared/apply-subscription-dialog/apply-subscription-dialog.module';
import { CustomUISharedModule } from '../shared/custom-ui-shared.module';
import { BarangaysComponent } from './barangays.component';
import { ManageBarangayComponent } from './manage-barangay/manage-barangay.component';

import { BarangaysRoutingModule } from './barangays.routing.module';

import * as BarangaysReducers from '../barangays/store/reducers';
import { BarangaysEffects } from './store/effects';

@NgModule({
  imports: [
    ApplySubscriptionDialogModule,
    CommonModule,
    CustomUISharedModule,
    BarangaysRoutingModule,
    MatInputModule,
    MatIconModule,
    MatRippleModule,
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
export class BarangaysModule { }
