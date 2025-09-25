import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface SalesTargetDetailsData {
  salesAgentName: string;
  targetAmount: number;
  achievedAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  startDate: string;
  endDate: string;
  daysLeft: number;
  isTargetMet: boolean;
  isTargetOverdue: boolean;
  targetSalesPerDay: number;
  targetSalesPerStore: number;
  totalStores: number;
  storesWithoutOrders: number;
}

@Component({
  selector: 'app-sales-target-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './sales-target-details-dialog.component.html',
  styleUrls: ['./sales-target-details-dialog.component.scss']
})
export class SalesTargetDetailsDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<SalesTargetDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SalesTargetDetailsData
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  getDaysLeftStatus(): string {
    if (this.data.isTargetOverdue) return 'overdue';
    if (this.data.daysLeft <= 7) return 'critical';
    if (this.data.daysLeft <= 14) return 'warning';
    return 'normal';
  }
}