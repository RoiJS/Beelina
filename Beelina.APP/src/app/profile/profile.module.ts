import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

import { CustomUISharedModule } from '../shared/custom-ui-shared.module';
import { ProfileRoutingModule } from './profile.routing.module';
import { ProfileComponent } from './profile.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatInputModule,
    MatIconModule,
    ProfileRoutingModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
  ],
  declarations: [ProfileComponent],
})
export class ProfileModule { }
