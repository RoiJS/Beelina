import { NgModule } from '@angular/core';

import { ProfileComponent } from './profile.component';
import { SharedModule } from '../shared/shared.module';
import { ProfileRoutingModule } from './profile.routing.module';

@NgModule({
  imports: [SharedModule, ProfileRoutingModule],
  declarations: [ProfileComponent],
})
export class ProfileModule {}
