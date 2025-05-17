import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

export interface AlertDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['../dialog.scss'],
})
export class AlertDialogComponent {
  dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);
  data = inject<AlertDialogData>(MAT_DIALOG_DATA);

  onConfirm(): void {
    this.dialogRef.close(this.data);
  }
}
