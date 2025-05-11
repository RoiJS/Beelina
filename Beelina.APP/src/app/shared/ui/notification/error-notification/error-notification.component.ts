import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-error-notification',
  templateUrl: './error-notification.component.html',
  styleUrls: [
    './error-notification.component.scss', '../notification.scss']
})
export class ErrorNotificationComponent {

  data = inject<{ message: string }>(MAT_SNACK_BAR_DATA);
  dialogRef = inject(MatSnackBarRef<ErrorNotificationComponent>);

  close() {
    this.dialogRef.dismiss();
  }
}
