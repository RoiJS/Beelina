import { Component, inject, signal } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { TranslateModule } from '@ngx-translate/core';

import { User } from 'src/app/_models/user.model';
import { ProductService } from 'src/app/_services/product.service';
import { StorageService } from 'src/app/_services/storage.service';

@Component({
  selector: 'app-copy-price-assignment-dialog',
  standalone: true,
  imports: [CommonModule, CustomUISharedModule, TranslateModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule],
  template: `
    <div class="product-filter-dialog-container">
      <div class="dialog-form-container__header">
        <span>{{ "COPY_PRODUCT_PRICE_DIALOG.TITLE" | translate }}</span>
        <mat-icon (click)="onClose()">cancel</mat-icon>
      </div>
      <div class="dialog-form-container__body">
        <mat-form-field appearance="fill" style="width: 100%;">
          <mat-label>{{ "COPY_PRODUCT_PRICE_DIALOG.SELECT_AGENT" | translate }}</mat-label>
          <mat-select [formControl]="agentControl">
            @for (agent of salesAgents(); track agent.id) {
            <mat-option [value]="agent.id">
              {{ agent.firstName }} {{ agent.lastName }}
            </mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
      <div class="dialog-form-container__footer">
        <div class="button-container">
          <button mat-raised-button color="primary" (click)="onConfirm()" [disabled]="!agentControl.value">
            {{ "GENERAL_TEXTS.CONFIRM" | translate }}
          </button>
          <button mat-raised-button color="default" (click)="onClose()">
            {{ "GENERAL_TEXTS.CLOSE" | translate }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class CopyPriceAssignmentDialogComponent {
  salesAgents = signal<Array<User>>([]);
  agentControl = new FormControl<number | null>(null);

  storageService = inject(StorageService);
  bottomSheetRef = inject(MatBottomSheetRef<CopyPriceAssignmentDialogComponent>);
  productService = inject(ProductService);

  constructor() {
    const currentSalesAgentId = +this.storageService.getString('currentSalesAgentId');
    this.productService.getSalesAgentsList().subscribe({
      next: (data) => {
        const filteredAgents = data.filter(agent => agent.id !== currentSalesAgentId);
        this.salesAgents.set(filteredAgents);
      }
    });
  }

  onConfirm() {
    if (this.agentControl.value) {
      this.bottomSheetRef.dismiss(this.agentControl.value);
    }
  }

  onClose() {
    this.bottomSheetRef.dismiss();
  }
}
