import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-success-dialog',
  templateUrl: './success-notification.component.html',
  styleUrls: ['./success-notification.component.scss', '../notification.scss'],
})
export class SuccessNotificationComponent implements OnInit {

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: { message: string },
    public dialogRef: MatSnackBarRef<SuccessNotificationComponent>,
  ) { }

  ngOnInit() {
  }

  close() {
    this.dialogRef.dismiss();
  }

}
