import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';
import { ProductWithdrawalFilter } from 'src/app/_models/filters/product-withdrawal.filter';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

@Component({
  selector: 'app-product-withdrawal-filter',
  templateUrl: './product-withdrawal-filter.component.html',
  styleUrls: ['./product-withdrawal-filter.component.scss']
})
export class ProductWithdrawalFilterComponent extends BaseComponent {

  private _productWithdrawalFilterForm: FormGroup;
  private _bottomSheetRef = inject(MatBottomSheetRef<ProductWithdrawalFilterComponent>);
  private formBuilder = inject(FormBuilder);

  private data = inject<ProductWithdrawalFilter>(MAT_BOTTOM_SHEET_DATA);

  constructor() {
    super();
    const startDate = this.data.startDate === '' ? this.data.startDate : DateFormatter.toDate(this.data.startDate);
    const endDate = this.data.endDate === '' ? this.data.endDate : DateFormatter.toDate(this.data.endDate);

    this._productWithdrawalFilterForm = this.formBuilder.group({
      startDate: [startDate],
      endDate: [endDate],
    });
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onReset() {
    this._bottomSheetRef.dismiss({
      startDate: '',
      endDate: ''
    });
  }

  onConfirm() {
    const startDate = this._productWithdrawalFilterForm.get('startDate').value;
    const endDate = this._productWithdrawalFilterForm.get('endDate').value;

    this._bottomSheetRef.dismiss({
      startDate, endDate
    });
  }

  get purchaseOrderFilterForm(): FormGroup {
    return this._productWithdrawalFilterForm;
  }

}
