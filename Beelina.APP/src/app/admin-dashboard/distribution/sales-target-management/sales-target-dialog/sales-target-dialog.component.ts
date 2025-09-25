import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SalesTarget } from '../../../../_models/sales-target.model';
import { User } from '../../../../_models/user.model';
import { SalesTargetPeriodType } from '../../../../_enum/sales-target-period-type.enum';
import { DialogService } from '../../../../shared/ui/dialog/dialog.service';
import { SalesTargetStore } from '../../../../_stores/sales-target.store';

export interface SalesTargetDialogData {
  salesTarget?: SalesTarget;
  selectedAgent: User;
  isEdit: boolean;
}

@Component({
  selector: 'app-sales-target-dialog',
  templateUrl: './sales-target-dialog.component.html',
  styleUrls: ['./sales-target-dialog.component.scss']
})
export class SalesTargetDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<SalesTargetDialogComponent>);
  private readonly dialogService = inject(DialogService);
  private readonly salesTargetStore = inject(SalesTargetStore);

  readonly SalesTargetPeriodType = SalesTargetPeriodType;

  salesTargetForm: FormGroup;
  serverError: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SalesTargetDialogData
  ) {
    this.salesTargetForm = this.fb.group({
      salesAgentId: [data.selectedAgent?.id || data.salesTarget?.salesAgentId, Validators.required],
      targetAmount: [data.salesTarget?.targetAmount || null, [Validators.required, Validators.min(0.01)]],
      periodType: [SalesTargetPeriodType.Monthly, Validators.required], // Always default to Monthly
      startDate: [data.salesTarget?.startDate || null, Validators.required],
      endDate: [data.salesTarget?.endDate || null, Validators.required],
      description: [data.salesTarget?.description || '']
    });
  }

  ngOnInit(): void {
    // Add date validation
    this.salesTargetForm.get('startDate')?.valueChanges.subscribe(() => {
      this.validateDateRange();
    });

    this.salesTargetForm.get('endDate')?.valueChanges.subscribe(() => {
      this.validateDateRange();
    });
  }

  private validateDateRange(): void {
    const startDate = this.salesTargetForm.get('startDate')?.value;
    const endDate = this.salesTargetForm.get('endDate')?.value;

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      this.salesTargetForm.get('endDate')?.setErrors({ invalidRange: true });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.salesTargetForm.valid) {
      // Clear any previous server errors
      this.serverError = null;
      
      const formValue = this.salesTargetForm.value;
      const actionText = this.data.isEdit ? 'update' : 'create';
      const confirmationTitle = `Confirm ${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Sales Target`;
      const confirmationMessage = `Are you sure you want to ${actionText} this sales target for ${this.data.selectedAgent.firstName} ${this.data.selectedAgent.lastName}?`;
      
      this.dialogService.openConfirmation(confirmationTitle, confirmationMessage)
        .subscribe((confirmed: boolean) => {
          if (confirmed) {
            const salesTarget: SalesTarget = {
              id: this.data.salesTarget?.id || 0,
              salesAgentId: formValue.salesAgentId,
              targetAmount: formValue.targetAmount,
              periodType: formValue.periodType,
              startDate: formValue.startDate,
              endDate: formValue.endDate,
              description: formValue.description,
              isActive: this.data.salesTarget?.isActive ?? true,
              salesAgent: this.data.selectedAgent,
              salesAgentName: `${this.data.selectedAgent.firstName} ${this.data.selectedAgent.lastName}`
            } as SalesTarget;

            // Subscribe to the store's updateSalesTarget method to handle server-side validation
            this.salesTargetStore.updateSalesTarget(salesTarget).subscribe({
              next: (result) => {
                if (result.success) {
                  this.dialogRef.close(result.salesTarget);
                } else {
                  // Handle server-side validation error
                  this.serverError = result.error;
                }
              },
              error: (error) => {
                // Handle unexpected errors
                this.serverError = error.message || 'An unexpected error occurred';
              }
            });
          }
        });
    }
  }
}
