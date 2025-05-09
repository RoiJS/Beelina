import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-success-dialog',
  templateUrl: './success-notification.component.html',
  styleUrls: ['./success-notification.component.scss', '../notification.scss'],
})
export class SuccessNotificationComponent {

  data = inject<{ message: string }>(MAT_SNACK_BAR_DATA);
  dialogRef = inject(MatSnackBarRef<SuccessNotificationComponent>);

  close() {
    this.dialogRef.dismiss();
  }
}
