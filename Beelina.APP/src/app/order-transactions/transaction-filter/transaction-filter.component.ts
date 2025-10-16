import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { TransactionsFilter } from 'src/app/_models/filters/transactions.filter';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';
import { User } from 'src/app/_models/user.model';
import { ProductService } from 'src/app/_services/product.service';

import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';
import { PaymentStatusEnum } from 'src/app/_enum/payment-status.enum';

@Component({
  selector: 'app-transaction-filter',
  templateUrl: './transaction-filter.component.html',
  styleUrls: ['./transaction-filter.component.scss']
})
export class TransactionFilterComponent extends BaseComponent implements OnInit {
  private _transactionFilterForm: FormGroup;
  private _bottomSheetRef = inject(MatBottomSheetRef<TransactionFilterComponent>);
  private _formBuilder = inject(FormBuilder);
  private _productService = inject(ProductService);

  data = inject<TransactionsFilter>(MAT_BOTTOM_SHEET_DATA);
  salesAgents: User[] = [];

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
      salesAgent: [this.data.salesAgentId],
    });
  }

  ngOnInit() {
    this.loadSalesAgents();
  }

  private loadSalesAgents() {
    this._productService.getSalesAgentsList().subscribe({
      next: (data: User[]) => {
        this.salesAgents = data;
      },
      error: (error) => {
        console.error('Error loading sales agents:', error);
        this.salesAgents = [];
      }
    });
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onReset() {
    this._bottomSheetRef.dismiss({
      transactionStatus: TransactionStatusEnum.ALL,
      dateFrom: DateFormatter.format(new Date()),
      dateTo: DateFormatter.format(new Date()),
      paymentStatus: PaymentStatusEnum.All,
      salesAgent: 0
    });
  }

  onConfirm() {
    const transactionStatus = this._transactionFilterForm.get('transactionStatus').value;
    const dateFromValue = this._transactionFilterForm.get('dateFrom').value;
    const dateToValue = this._transactionFilterForm.get('dateTo').value;
    const paymentStatus = this._transactionFilterForm.get('paymentStatus').value;
    const salesAgent = this._transactionFilterForm.get('salesAgent').value;

    const dateFrom = dateFromValue ? DateFormatter.format(dateFromValue) : '';
    const dateTo = dateToValue ? DateFormatter.format(dateToValue) : '';

    this._bottomSheetRef.dismiss({
      transactionStatus,
      dateFrom,
      dateTo,
      paymentStatus,
      salesAgent
    });
  }

  get transactionFilterForm(): FormGroup {
    return this._transactionFilterForm;
  }

}
