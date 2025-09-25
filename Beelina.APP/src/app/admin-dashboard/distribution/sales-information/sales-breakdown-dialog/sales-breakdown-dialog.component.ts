import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface SalesBreakdownData {
  salesAgentName: string;
  totalSalesAmount: number;
  netSalesAmount: number;
  taxAmount: number;
  discountAmount: number;
  cashOnHand: number;
  chequeOnHand: number;
  accountReceivables: number;
  badOrders: number;
}

@Component({
  selector: 'app-sales-breakdown-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './sales-breakdown-dialog.component.html',
  styleUrls: ['./sales-breakdown-dialog.component.scss']
})
export class SalesBreakdownDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<SalesBreakdownDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SalesBreakdownData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}