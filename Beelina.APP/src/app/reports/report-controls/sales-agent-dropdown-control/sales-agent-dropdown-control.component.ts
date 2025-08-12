import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

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
export class SalesAgentDropdownControlComponent extends BaseControlComponent implements OnInit, OnDestroy {

  private _form: FormGroup;
  private _salesAgents: User[];
  private _destroy$ = new Subject<void>();

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
    // Listen for sales agent selection changes
    this._form.get('salesAgent')?.valueChanges.pipe(
      takeUntil(this._destroy$)
    ).subscribe((selectedSalesAgentId: number) => {
      if (selectedSalesAgentId) {
        this.updateInvoiceNumberControlSalesAgent(selectedSalesAgentId);
      }
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private updateInvoiceNumberControlSalesAgent(salesAgentId: number) {
    // Find the invoice number autocomplete control
    const invoiceNoControl = this.otherControls.find(control =>
      control.name === 'InvoiceNoAutocompleteControl'
    );

    if (invoiceNoControl && invoiceNoControl.componentInstance) {
      // Update the sales agent ID in the invoice number control
      if (invoiceNoControl.componentInstance.setSalesAgentId) {
        invoiceNoControl.componentInstance.setSalesAgentId(salesAgentId);
      }
    }
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
