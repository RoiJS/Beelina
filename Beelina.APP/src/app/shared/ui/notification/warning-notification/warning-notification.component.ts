import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-warning-notification',
  templateUrl: './warning-notification.component.html',
  styleUrls: ['./warning-notification.component.scss', '../notification.scss']
})
export class WarningNotificationComponent {

  data = inject<{ message: string }>(MAT_SNACK_BAR_DATA);
  dialogRef = inject(MatSnackBarRef<WarningNotificationComponent>);

  close() {
    this.dialogRef.dismiss();
  }

}
