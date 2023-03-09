import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

import { DialogService } from './dialog.service';

import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { AlertDialogComponent } from './alert-dialog/alert-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    TranslateModule.forChild(),
  ],
  exports: [MatDialogModule, MatButtonModule, MatDividerModule, MatIconModule],
  declarations: [ConfirmationDialogComponent, AlertDialogComponent],
  providers: [DialogService],
})
export class DialogModule {}
