import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { TransactionsFilter } from 'src/app/_models/filters/transactions.filter';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';

import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';
import { PaymentStatusEnum } from 'src/app/_enum/payment-status.enum';

@Component({
  selector: 'app-transaction-filter',
  templateUrl: './transaction-filter.component.html',
  styleUrls: ['./transaction-filter.component.scss']
})
export class TransactionFilterComponent extends BaseComponent {
  private _transactionFilterForm: FormGroup;
  private _bottomSheetRef = inject(MatBottomSheetRef<TransactionFilterComponent>);
  private _formBuilder = inject(FormBuilder);

  data = inject<TransactionsFilter>(MAT_BOTTOM_SHEET_DATA);

  PaymentStatusEnum = PaymentStatusEnum;
  TransactionStatusEnum = TransactionStatusEnum;

  constructor() {
    super();
    const dateFrom = this.data.dateFrom === '' ? this.data.dateFrom : DateFormatter.toDate(this.data.dateFrom);
    const dateTo = this.data.dateTo === '' ? this.data.dateTo : DateFormatter.toDate(this.data.dateTo);
    this._transactionFilterForm = this._formBuilder.group({
      transactionStatus: [this.data.status],
      dateFrom: [dateFrom],
      dateTo: [dateTo],
      paymentStatus: [this.data.paymentStatus],
    });
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onReset() {
    this._bottomSheetRef.dismiss({
      transactionStatus: TransactionStatusEnum.ALL,
      dateFrom: '',
      dateTo: '',
      paymentStatus: PaymentStatusEnum.All
    });
  }

  onConfirm() {
    const transactionStatus = this._transactionFilterForm.get('transactionStatus').value;
    const dateFromValue = this._transactionFilterForm.get('dateFrom').value;
    const dateToValue = this._transactionFilterForm.get('dateTo').value;
    const paymentStatus = this._transactionFilterForm.get('paymentStatus').value;

    const dateFrom = dateFromValue ? DateFormatter.format(dateFromValue) : '';
    const dateTo = dateToValue ? DateFormatter.format(dateToValue) : '';

    this._bottomSheetRef.dismiss({
      transactionStatus,
      dateFrom,
      dateTo,
      paymentStatus
    });
  }

  get transactionFilterForm(): FormGroup {
    return this._transactionFilterForm;
  }

}
