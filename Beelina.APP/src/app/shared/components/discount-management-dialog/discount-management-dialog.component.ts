import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductWarehouseStockReceiptDiscount } from '../../../_models/product-warehouse-stock-receipt-discount.model';
import { DiscountCalculationHelper } from '../../../_helpers/discount-calculation.helper';

export interface DiscountDialogData {
  discounts: ProductWarehouseStockReceiptDiscount[];
  grossAmount: number;
  readonly?: boolean;
}

@Component({
  selector: 'app-discount-management-dialog',
  templateUrl: './discount-management-dialog.component.html',
  styleUrls: ['./discount-management-dialog.component.scss']
})
export class DiscountManagementDialogComponent implements OnInit {
  discountForm: FormGroup;
  grossAmount: number;
  readonly: boolean;
  isCalculationExpanded: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DiscountManagementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DiscountDialogData
  ) {
    this.grossAmount = data.grossAmount || 0;
    this.readonly = data.readonly || false;

    this.discountForm = this.fb.group({
      discounts: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.initializeDiscounts();
  }

  get discountsArray(): FormArray {
    return this.discountForm.get('discounts') as FormArray;
  }

  private initializeDiscounts(): void {
    if (this.data.discounts && this.data.discounts.length > 0) {
      this.data.discounts.forEach(discount => {
        this.addDiscountFormGroup(discount);
      });
    } else {
      // Add one empty discount by default
      this.addDiscountFormGroup();
    }
  }

  private addDiscountFormGroup(discount?: ProductWarehouseStockReceiptDiscount): void {
    const discountGroup = this.fb.group({
      id: [discount?.id || 0],
      discountPercentage: [
        discount?.discountPercentage || 0,
        [Validators.required, Validators.min(0.01), Validators.max(100)]
      ],
      discountOrder: [discount?.discountOrder || this.getNextDiscountOrder()],
      description: [discount?.description || '', [Validators.maxLength(255)]]
    });

    this.discountsArray.push(discountGroup);
  }

  addDiscount(): void {
    if (!this.readonly) {
      this.addDiscountFormGroup();
    }
  }


  removeDiscount(index: number): void {
    if (!this.readonly && this.discountsArray.length > 0) {
      this.discountsArray.removeAt(index);
      this.reorderDiscounts();
    }
  }

  moveDiscountUp(index: number): void {
    if (!this.readonly && index > 0) {
      const discountArray = this.discountsArray;
      const currentDiscount = discountArray.at(index);
      const previousDiscount = discountArray.at(index - 1);

      discountArray.setControl(index, previousDiscount);
      discountArray.setControl(index - 1, currentDiscount);

      this.reorderDiscounts();
    }
  }

  moveDiscountDown(index: number): void {
    if (!this.readonly && index < this.discountsArray.length - 1) {
      const discountArray = this.discountsArray;
      const currentDiscount = discountArray.at(index);
      const nextDiscount = discountArray.at(index + 1);

      discountArray.setControl(index, nextDiscount);
      discountArray.setControl(index + 1, currentDiscount);

      this.reorderDiscounts();
    }
  }

  private reorderDiscounts(): void {
    this.discountsArray.controls.forEach((control, index) => {
      control.get('discountOrder')?.setValue(index + 1);
    });
  }

  private getNextDiscountOrder(): number {
    return this.discountsArray.length + 1;
  }

  getDiscountErrors(index: number): string[] {
    const control = this.discountsArray.at(index);
    const errors: string[] = [];

    // Only show errors if the discount percentage is greater than 0 or if user has interacted with the field
    const discountPercentage = control.get('discountPercentage');
    const description = control.get('description');

    if (discountPercentage?.value > 0 || discountPercentage?.touched) {
      if (discountPercentage?.hasError('required')) {
        errors.push('DISCOUNT_MANAGEMENT_DIALOG.VALIDATION.DISCOUNT_PERCENTAGE_REQUIRED');
      }
      if (discountPercentage?.hasError('min')) {
        errors.push('DISCOUNT_MANAGEMENT_DIALOG.VALIDATION.DISCOUNT_PERCENTAGE_MIN');
      }
      if (discountPercentage?.hasError('max')) {
        errors.push('DISCOUNT_MANAGEMENT_DIALOG.VALIDATION.DISCOUNT_PERCENTAGE_MAX');
      }
    }

    if (description?.hasError('maxlength')) {
      errors.push('DISCOUNT_MANAGEMENT_DIALOG.VALIDATION.DESCRIPTION_MAX_LENGTH');
    }

    return errors;
  }

  getCurrentDiscounts(): ProductWarehouseStockReceiptDiscount[] {
    return this.discountsArray.value.filter((discount: any) =>
      discount.discountPercentage > 0
    ).map((discount: any) => new ProductWarehouseStockReceiptDiscount(discount));
  }

  getNetAmount(): number {
    const discounts = this.getCurrentDiscounts();
    return DiscountCalculationHelper.calculateNetAmount(this.grossAmount, discounts);
  }

  getTotalDiscountPercentage(): number {
    const discounts = this.getCurrentDiscounts();
    return DiscountCalculationHelper.calculateTotalDiscountPercentage(discounts);
  }

  getTotalDiscountAmount(): number {
    const discounts = this.getCurrentDiscounts();
    return DiscountCalculationHelper.calculateTotalDiscountAmount(this.grossAmount, discounts);
  }

  getDiscountBreakdown(): Array<{step: number, description: string, percentage: number, amountBefore: number, discountAmount: number, amountAfter: number}> {
    const discounts = this.getCurrentDiscounts();
    if (!discounts || discounts.length === 0) {
      return [];
    }

    // Sort discounts by order to ensure proper sequential application
    const orderedDiscounts = discounts
      .filter(d => d.discountPercentage > 0)
      .sort((a, b) => a.discountOrder - b.discountOrder);

    const breakdown: Array<{step: number, description: string, percentage: number, amountBefore: number, discountAmount: number, amountAfter: number}> = [];
    let currentAmount = this.grossAmount;

    for (let i = 0; i < orderedDiscounts.length; i++) {
      const discount = orderedDiscounts[i];
      const discountAmount = currentAmount * (discount.discountPercentage / 100);
      const amountAfter = currentAmount - discountAmount;
      
      breakdown.push({
        step: i + 1,
        description: discount.description || `Discount ${i + 1}`,
        percentage: discount.discountPercentage,
        amountBefore: Math.round(currentAmount * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        amountAfter: Math.round(amountAfter * 100) / 100
      });

      currentAmount = amountAfter;
    }

    return breakdown;
  }

  toggleCalculationExpansion(): void {
    this.isCalculationExpanded = !this.isCalculationExpanded;
  }

  isFormValid(): boolean {
    // Only validate discounts that have a percentage > 0
    const validDiscounts = this.discountsArray.controls.filter(control =>
      control.get('discountPercentage')?.value > 0
    );

    // Check if any valid discount has validation errors
    for (const control of validDiscounts) {
      if (control.get('discountPercentage')?.invalid || control.get('description')?.invalid) {
        return false;
      }
    }

    // Check for duplicate descriptions among valid discounts with non-empty descriptions
    const descriptions = validDiscounts
      .map(control => control.get('description')?.value?.trim()?.toLowerCase())
      .filter(desc => desc && desc.length > 0);

    const uniqueDescriptions = new Set(descriptions);

    return descriptions.length === uniqueDescriptions.size;
  }

  onSave(): void {
    if (this.isFormValid()) {
      const discounts = this.getCurrentDiscounts();
      const reorderedDiscounts = DiscountCalculationHelper.reorderDiscounts(discounts);
      this.dialogRef.close({ discounts: reorderedDiscounts });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onClearAll(): void {
    if (!this.readonly) {
      this.discountsArray.clear();
      this.addDiscountFormGroup(); // Add one empty discount
    }
  }
}
