import { Component, inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from 'src/app/_services/auth.service';
import { ProductService } from 'src/app/_services/product.service';
import { User } from 'src/app/_models/user.model';

import { BaseControlComponent } from '../base-control/base-control.component';
import { getSalesAgentTypeEnumNumeric } from 'src/app/_enum/sales-agent-type.enum';

@Component({
  selector: 'app-sales-agent-dropdown-control',
  templateUrl: './sales-agent-dropdown-control.component.html',
  styleUrls: ['./sales-agent-dropdown-control.component.scss']
})
export class SalesAgentDropdownControlComponent extends BaseControlComponent implements OnInit {

  private _form: FormGroup;
  private _salesAgents: User[];

  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private productService = inject(ProductService);

  constructor(protected override translateService: TranslateService) {
    super(translateService);

    this._form = this.formBuilder.group({
      salesAgent: [null, Validators.required],
    });

    this.productService.getSalesAgentsList().subscribe({
      next: (data: Array<User>) => {
        if (this.agentTypeOptions) data = data.filter((user: User) => this.agentTypeOptions.includes(getSalesAgentTypeEnumNumeric(user.salesAgentType).toString()));
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
