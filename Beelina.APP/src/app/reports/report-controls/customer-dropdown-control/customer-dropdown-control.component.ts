import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { BaseControlComponent } from '../base-control/base-control.component';
import { CustomerStore } from 'src/app/_models/customer-store';
import { CustomerStoreService } from 'src/app/_services/customer-store.service';

@Component({
  selector: 'app-customer-dropdown-control',
  templateUrl: './customer-dropdown-control.component.html',
  styleUrls: ['./customer-dropdown-control.component.scss']
})
export class CustomerDropdownControlComponent extends BaseControlComponent implements OnInit {
  private _form: FormGroup;
  private _stores: CustomerStore[];

  constructor(
    private formBuilder: FormBuilder,
    private storeService: CustomerStoreService,
    protected override translateService: TranslateService
  ) {
    super(translateService);

    this._form = this.formBuilder.group({
      store: [null, Validators.required],
    });

    this.storeService.getAllCustomerStores().subscribe({
      next: (data: Array<CustomerStore>) => {
        this._stores = data;
      },
    });
  }

  override ngOnInit() {
  }

  override value(value: any) {
    const currentValue = this._form.get('store').value;
    return currentValue.toString();
  }

  override validate(): boolean {
    this._form.markAllAsTouched();
    return this._form.valid;
  }

  get stores(): Array<CustomerStore> {
    return this._stores;
  }

  get form(): FormGroup {
    return this._form;
  }

}
