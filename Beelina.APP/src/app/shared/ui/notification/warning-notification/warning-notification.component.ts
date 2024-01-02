import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-warning-notification',
  templateUrl: './warning-notification.component.html',
  styleUrls: ['./warning-notification.component.scss', '../notification.scss']
})
export class WarningNotificationComponent implements OnInit {

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: { message: string },
    public dialogRef: MatSnackBarRef<WarningNotificationComponent>,
  ) { }

  ngOnInit() {
  }

  close() {
    this.dialogRef.dismiss();
  }

}
