import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SuccessNotificationComponent } from './success-notification/success-notification.component';
import { ErrorNotificationComponent } from './error-notification/error-notification.component';
import { WarningNotificationComponent } from './warning-notification/warning-notification.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) { }

  openSuccessNotification(message: string) {
    this.snackBar.openFromComponent(SuccessNotificationComponent, {
      data: {
        message
      }
    })
  }

  openErrorNotification(message: string) {
    this.snackBar.openFromComponent(ErrorNotificationComponent, {
      data: {
        message
      }
    })
  }

  openWarningNotification(message: string) {
    this.snackBar.openFromComponent(WarningNotificationComponent, {
      data: {
        message
      }
    })
  }
}
