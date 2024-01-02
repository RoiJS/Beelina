import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AuthComponent } from './auth.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { CustomUISharedModule } from '../shared/custom-ui-shared.module';
import { LoginEffects } from './store/effects';
import { reducers } from './store/reducers';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: AuthComponent,
        title: 'AUTH_PAGE.TITLE',
      },
    ]),
    TranslateModule.forChild(),
    StoreModule.forFeature('authCredentials', reducers),
    EffectsModule.forFeature([LoginEffects]),
  ],
  declarations: [AuthComponent],
})
export class AuthModule { }
