import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { ProductsFilter } from 'src/app/_models/filters/products.filter';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

import { SupplierStore } from '../../suppliers/suppliers.store';

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.scss']
})
export class ProductFilterComponent extends BaseComponent implements OnInit {

  private _productFilterForm: FormGroup;

  supplierStore = inject(SupplierStore);

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ProductFilterComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: ProductsFilter,
    private formBuilder: FormBuilder,
  ) {
    super();
    this.supplierStore.reset();
    this.supplierStore.getSuppliers();
    this._productFilterForm = this.formBuilder.group({
      supplierId: [data.supplierId],
    });
  }

  ngOnInit() {
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onReset() {
    this._bottomSheetRef.dismiss({
      supplierId: 0
    });
  }

  onConfirm() {
    const supplierId = this._productFilterForm.get('supplierId').value;
    this._bottomSheetRef.dismiss({
      supplierId
    });
  }

  get productFilterForm(): FormGroup {
    return this._productFilterForm;
  }
}
