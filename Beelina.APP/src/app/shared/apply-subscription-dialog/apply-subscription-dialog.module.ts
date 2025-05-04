import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { ApplySubscriptionDialogComponent } from './apply-subscription-dialog.component';
import { CustomUISharedModule } from '../custom-ui-shared.module';

@NgModule({
  imports: [
    CustomUISharedModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule.forChild(),
  ],
  exports: [ApplySubscriptionDialogComponent],
  declarations: [ApplySubscriptionDialogComponent],
})
export class ApplySubscriptionDialogModule { }
