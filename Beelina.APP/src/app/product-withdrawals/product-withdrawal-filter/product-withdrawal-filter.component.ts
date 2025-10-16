import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';
import { ProductWithdrawalFilter } from 'src/app/_models/filters/product-withdrawal.filter';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { User } from 'src/app/_models/user.model';
import { ProductService } from 'src/app/_services/product.service';
import { SalesAgentTypeEnum } from 'src/app/_enum/sales-agent-type.enum';

@Component({
  selector: 'app-product-withdrawal-filter',
  templateUrl: './product-withdrawal-filter.component.html',
  styleUrls: ['./product-withdrawal-filter.component.scss']
})
export class ProductWithdrawalFilterComponent extends BaseComponent {

  private _productWithdrawalFilterForm: FormGroup;
  private _bottomSheetRef = inject(MatBottomSheetRef<ProductWithdrawalFilterComponent>);
  private formBuilder = inject(FormBuilder);
  private productService = inject(ProductService);

  private data = inject<ProductWithdrawalFilter>(MAT_BOTTOM_SHEET_DATA);

  salesAgents = signal<User[]>([]);

  constructor() {
    super();
    this.loadSalesAgents();

    const startDate = this.data.startDate === '' ? this.data.startDate : DateFormatter.toDate(this.data.startDate);
    const endDate = this.data.endDate === '' ? this.data.endDate : DateFormatter.toDate(this.data.endDate);

    this._productWithdrawalFilterForm = this.formBuilder.group({
      startDate: [startDate],
      endDate: [endDate],
      salesAgentId: [this.data.salesAgentId || 0],
    });
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onReset() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this._bottomSheetRef.dismiss({
      startDate: firstDayOfMonth,
      endDate: lastDayOfMonth,
      salesAgentId: 0
    });
  }

  onConfirm() {
    const startDate = this._productWithdrawalFilterForm.get('startDate').value;
    const endDate = this._productWithdrawalFilterForm.get('endDate').value;
    const salesAgentId = this._productWithdrawalFilterForm.get('salesAgentId').value;

    this._bottomSheetRef.dismiss({
      startDate, endDate, salesAgentId
    });
  }

  get purchaseOrderFilterForm(): FormGroup {
    return this._productWithdrawalFilterForm;
  }

  private loadSalesAgents() {
    this.productService.getSalesAgentsList().subscribe({
      next: (salesAgents: User[]) => {
        // Filter to show only Field Agents
        const fieldAgents = salesAgents.filter(agent =>
          agent.salesAgentType === SalesAgentTypeEnum.FieldAgent
        );
        this.salesAgents.set(fieldAgents);
      },
      error: (error) => {
        console.error('Error loading sales agents:', error);
      }
    });
  }

}
