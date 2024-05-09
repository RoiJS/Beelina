import { Component, OnInit } from '@angular/core';
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

  constructor(
    private formBuilder: FormBuilder,
    protected override translateService: TranslateService
  ) {
    super(translateService);
    this._form = this.formBuilder.group({
      transactionType: [TransactionStatusEnum.CONFIRMED, Validators.required],
    });
  }

  override value(value: any) {
    const currentValue = this._form.get('transactionType').value;
    return getTransactionStatusEnum(currentValue).toString();
  }

  override ngOnInit() {
  }

  get form(): FormGroup {
    return this._form;
  }
}
