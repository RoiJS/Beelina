import { NgModule } from '@angular/core';
import { OfflineComponent } from './offline.component';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: OfflineComponent,
      },
    ]),
    TranslateModule.forChild(),
  ],
  declarations: [OfflineComponent],
})
export class OfflineModule {}
