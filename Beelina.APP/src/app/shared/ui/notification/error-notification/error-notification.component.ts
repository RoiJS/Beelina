import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-error-notification',
  templateUrl: './error-notification.component.html',
  styleUrls: [
    './error-notification.component.scss', '../notification.scss']
})
export class ErrorNotificationComponent implements OnInit {

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: { message: string },
    public dialogRef: MatSnackBarRef<ErrorNotificationComponent>,
  ) { }

  ngOnInit() {
  }

  close() {
    this.dialogRef.dismiss();
  }

}
