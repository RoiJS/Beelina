import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { OrderTransactionStore } from '../order-transactions.store';
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

  transactionsStore = inject(OrderTransactionStore);

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<TransactionFilterComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: TransactionsFilter,
    private formBuilder: FormBuilder,
  ) {
    super();
    const transactionDate = data.transactionDate === '' ? data.transactionDate : DateFormatter.toDate(data.transactionDate);
    this._transactionFilterForm = this.formBuilder.group({
      transactionStatus: [data.status],
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
