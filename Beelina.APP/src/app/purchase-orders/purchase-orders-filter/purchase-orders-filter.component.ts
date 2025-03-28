import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';
import { PurchaseOrderFilter } from 'src/app/_models/filters/purchase-order.filter';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

@Component({
  selector: 'app-purchase-orders-filter',
  templateUrl: './purchase-orders-filter.component.html',
  styleUrls: ['./purchase-orders-filter.component.scss']
})
export class PurchaseOrdersFilterComponent extends BaseComponent implements OnInit {

  private _purchaseOrderFilterForm: FormGroup;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<PurchaseOrdersFilterComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: PurchaseOrderFilter,
    private formBuilder: FormBuilder,
  ) {
    super();
    const startDate = data.startDate === '' ? data.startDate : DateFormatter.toDate(data.startDate);
    const endDate = data.endDate === '' ? data.endDate : DateFormatter.toDate(data.endDate);

    this._purchaseOrderFilterForm = this.formBuilder.group({
      startDate: [startDate],
      endDate: [endDate],
    });
  }

  ngOnInit() {
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
    const startDate = this._purchaseOrderFilterForm.get('startDate').value;
    const endDate = this._purchaseOrderFilterForm.get('endDate').value;

    this._bottomSheetRef.dismiss({
      startDate, endDate
    });
  }

  get purchaseOrderFilterForm(): FormGroup {
    return this._purchaseOrderFilterForm;
  }

}
