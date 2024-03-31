import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { BannerComponent } from './banner.component';

@NgModule({
  imports: [
    MatIconModule
  ],
  declarations: [BannerComponent],
  exports: [BannerComponent]
})
export class BannerModule { }
