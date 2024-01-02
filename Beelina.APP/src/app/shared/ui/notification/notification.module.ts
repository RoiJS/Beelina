import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { NotificationService } from './notification.service';

import { SuccessNotificationComponent } from './success-notification/success-notification.component';
import { ErrorNotificationComponent } from './error-notification/error-notification.component';
import { WarningNotificationComponent } from './warning-notification/warning-notification.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatSnackBarModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    ErrorNotificationComponent,
    SuccessNotificationComponent,
    WarningNotificationComponent
  ],
  providers: [NotificationService],
})
export class NotificationModule { }
