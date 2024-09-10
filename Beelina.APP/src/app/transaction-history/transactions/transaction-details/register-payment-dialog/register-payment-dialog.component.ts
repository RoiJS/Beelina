import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { Payment } from 'src/app/_models/payment';
import { Transaction } from 'src/app/_models/transaction';
import { NumberFormatter } from 'src/app/_helpers/formatters/number-formatter.helper';
import { UserAccountService } from 'src/app/_services/user-account.service';

@Component({
  selector: 'app-register-payment-dialog',
  templateUrl: './register-payment-dialog.component.html',
  styleUrls: ['./register-payment-dialog.component.scss']
})
export class RegisterPaymentDialogComponent implements OnInit {

  private _registerPaymentForm: FormGroup;

  userService = inject(UserAccountService);

  maxAmountHint = signal<string>('');
  maxAmount = signal<number>(0);

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<RegisterPaymentDialogComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      payment: Payment;
      transaction: Transaction
    },
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
  ) {
    this.maxAmount.set(data.transaction.balance);
    this.maxAmountHint.set(NumberFormatter.formatCurrency(this.maxAmount()));
    this._registerPaymentForm = this.formBuilder.group({
      amount: [data.payment.amount, [Validators.required, Validators.min(0), Validators.max(this.maxAmount())]],
      paymentDate: [data.payment.paymentDate, Validators.required],
      notes: [data.payment.notes],
      paid: [false]
    });
  }

  ngOnInit() {
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onConfirm() {
    if (!this._registerPaymentForm.valid) return;

    const amount = this._registerPaymentForm.get('amount').value;
    const paymentDate = this._registerPaymentForm.get('paymentDate').value;
    const notes = this._registerPaymentForm.get('notes').value;
    const paid = this._registerPaymentForm.get('paid').value;

    const payment = new Payment();
    payment.id = this.data.payment.id;
    payment.transactionId = this.data.payment.transactionId;
    payment.amount = amount;
    payment.paymentDate = paymentDate;
    payment.notes = notes;
    console.log(payment);
    this._bottomSheetRef.dismiss({ payment, paid });
  }

  get registerPaymentForm(): FormGroup {
    return this._registerPaymentForm;
  }

  get notesControlHintText(): string {
    return this.translateService.instant("PAYMENTS_PAGE.REGISTER_PAYMENT_DIALOG.FORM_CONTROL_SECTION.NOTES_CONTROL.HINT");
  }
}
