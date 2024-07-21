import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from 'src/app/_services/auth.service';
import { ProductService } from 'src/app/_services/product.service';
import { User } from 'src/app/_models/user.model';

import { BaseControlComponent } from '../base-control/base-control.component';

@Component({
  selector: 'app-sales-agent-dropdown-control',
  templateUrl: './sales-agent-dropdown-control.component.html',
  styleUrls: ['./sales-agent-dropdown-control.component.scss']
})
export class SalesAgentDropdownControlComponent extends BaseControlComponent implements OnInit {

  private _form: FormGroup;
  private _salesAgents: User[];

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private productService: ProductService,
    protected override translateService: TranslateService
  ) {
    super(translateService);

    this._form = this.formBuilder.group({
      salesAgent: [null, Validators.required],
    });

    this.productService.getSalesAgentsList().subscribe({
      next: (data: Array<User>) => {
        this._salesAgents = data;
      },
    });
  }

  override ngOnInit() {
  }

  override value(value: any) {
    const currentValue = this._form.get('salesAgent').value;
    return currentValue.toString();
  }

  override validate(): boolean {
    if (this.hide) this._form.get('salesAgent').setValue(this.authService.userId);
    this._form.markAllAsTouched();
    return this._form.valid;
  }

  get salesAgents(): Array<User> {
    return this._salesAgents;
  }

  get form(): FormGroup {
    return this._form;
  }
}
