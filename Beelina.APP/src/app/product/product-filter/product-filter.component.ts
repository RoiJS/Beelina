import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { ProductsFilter } from 'src/app/_models/filters/products.filter';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

import { SupplierStore } from '../../suppliers/suppliers.store';

import { StockStatusEnum } from 'src/app/_enum/stock-status.enum';
import { PriceStatusEnum } from 'src/app/_enum/price-status.enum';
import { ProductActiveStatusEnum } from 'src/app/_enum/product-active-status.enum';

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.scss']
})
export class ProductFilterComponent extends BaseComponent {

  private _productFilterForm: FormGroup;

  private _bottomSheetRef = inject(MatBottomSheetRef<ProductFilterComponent>);
  private _formBuilder = inject(FormBuilder);
  supplierStore = inject(SupplierStore);

  data = inject<{ defaultProductsFilter: ProductsFilter, currentProductsFilter: ProductsFilter }>(MAT_BOTTOM_SHEET_DATA);

  StockStatusEnum = StockStatusEnum;
  PriceStatusEnum = PriceStatusEnum;
  ProductActiveStatusEnum = ProductActiveStatusEnum;

  constructor() {
    super();
    this.supplierStore.reset();
    this.supplierStore.getSuppliers();
    this._productFilterForm = this._formBuilder.group({
      supplierId: [this.data.currentProductsFilter.supplierId],
      stockStatus: [this.data.currentProductsFilter.stockStatus],
      priceStatus: [this.data.currentProductsFilter.priceStatus],
      activeStatus: [this.data.currentProductsFilter.activeStatus],
    });
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onReset() {
    this._bottomSheetRef.dismiss({
      supplierId: this.data.defaultProductsFilter.supplierId,
      stockStatus: this.data.defaultProductsFilter.stockStatus,
      priceStatus: this.data.defaultProductsFilter.priceStatus,
      activeStatus: this.data.defaultProductsFilter.activeStatus
    });
  }

  onConfirm() {
    const supplierId = this._productFilterForm.get('supplierId').value;
    const stockStatus = this._productFilterForm.get('stockStatus').value;
    const priceStatus = this._productFilterForm.get('priceStatus').value;
    const activeStatus = this._productFilterForm.get('activeStatus').value;
    this._bottomSheetRef.dismiss({
      supplierId,
      stockStatus,
      priceStatus,
      activeStatus
    });
  }

  get productFilterForm(): FormGroup {
    return this._productFilterForm;
  }
}
