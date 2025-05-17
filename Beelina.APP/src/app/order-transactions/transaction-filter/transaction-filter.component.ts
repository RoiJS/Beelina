import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { TransactionsFilter } from 'src/app/_models/filters/transactions.filter';
import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';

@Component({
  selector: 'app-transaction-filter',
  templateUrl: './transaction-filter.component.html',
  styleUrls: ['./transaction-filter.component.scss']
})
export class TransactionFilterComponent extends BaseComponent implements OnInit {
  private _transactionFilterForm: FormGroup;
  private _bottomSheetRef = inject(MatBottomSheetRef<TransactionFilterComponent>);
  private _formBuilder = inject(FormBuilder);

  data = inject<TransactionsFilter>(MAT_BOTTOM_SHEET_DATA);

  constructor() {
    super();
    const transactionDate = this.data.transactionDate === '' ? this.data.transactionDate : DateFormatter.toDate(this.data.transactionDate);
    this._transactionFilterForm = this._formBuilder.group({
      transactionStatus: [this.data.status],
      transactionDate: [transactionDate],
    });
  }

  ngOnInit() {
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onReset() {
    this._bottomSheetRef.dismiss({
      transactionStatus: TransactionStatusEnum.ALL,
      transactionDate: ''
    });
  }

  onConfirm() {
    const transactionStatus = this._transactionFilterForm.get('transactionStatus').value;
    const transactionDate = this._transactionFilterForm.get('transactionDate').value;

    this._bottomSheetRef.dismiss({
      transactionStatus, transactionDate
    });
  }

  get transactionFilterForm(): FormGroup {
    return this._transactionFilterForm;
  }

}
