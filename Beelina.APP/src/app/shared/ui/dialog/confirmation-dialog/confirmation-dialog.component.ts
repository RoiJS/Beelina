import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';

export interface ConfirmationDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['../dialog.scss'],
})
export class ConfirmationDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  ngOnInit() {}

  onConfirm(): void {
    this.dialogRef.close(ButtonOptions.YES);
  }

  onCancel() {
    this.dialogRef.close(ButtonOptions.NO);
  }
}
