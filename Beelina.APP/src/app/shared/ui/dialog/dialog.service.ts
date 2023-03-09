import { Injectable } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from './alert-dialog/alert-dialog.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(public dialog: MatDialog) {}

  openConfirmation(title: string, message: string) {
    return this.dialog
      .open(ConfirmationDialogComponent, {
        data: { title, message },
      })
      .afterClosed();
  }

  openAlert(title: string, message: string) {
    return this.dialog
      .open(AlertDialogComponent, {
        data: { title, message },
      })
      .afterClosed();
  }
}
