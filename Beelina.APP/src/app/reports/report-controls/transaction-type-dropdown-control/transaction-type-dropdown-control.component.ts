import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BaseControlComponent } from '../base-control/base-control.component';
import { TransactionStatusEnum, getTransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';

@Component({
  selector: 'app-transaction-type-dropdown-control',
  templateUrl: './transaction-type-dropdown-control.component.html',
  styleUrls: ['./transaction-type-dropdown-control.component.scss']
})
export class TransactionTypeDropdownControlComponent extends BaseControlComponent implements OnInit {

  private _form: FormGroup;
  private _formBuilder = inject(FormBuilder);

  constructor(protected override translateService: TranslateService) {
    super(translateService);
    this._form = this._formBuilder.group({
      transactionType: [TransactionStatusEnum.CONFIRMED, Validators.required],
    });
  }

  override value(value: any) {
    const currentValue = this._form.get('transactionType').value;
    return getTransactionStatusEnum(currentValue).toString();
  }

  override ngOnInit() {
  }

  override validate(): boolean {
    // If the transaction type control is disabled, consider it valid
    const transactionTypeControl = this._form.get('transactionType');
    if (transactionTypeControl?.disabled) {
      return true;
    }

    // Otherwise, perform normal validation
    this._form.markAllAsTouched();
    return this._form.valid;
  }

  get form(): FormGroup {
    return this._form;
  }
}
