import { NgModule } from '@angular/core';
import { AuthComponent } from './auth.component';
import {
  RouterModule,
} from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../shared/shared.module';
import { LoginEffects } from './store/effects';
import { reducers } from './store/reducers';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: AuthComponent,
        title: 'AUTH_PAGE.TITLE',
      },
    ]),
    StoreModule.forFeature('authCredentials', reducers),
    EffectsModule.forFeature([LoginEffects]),
  ],
  declarations: [AuthComponent],
})
export class AuthModule {}
