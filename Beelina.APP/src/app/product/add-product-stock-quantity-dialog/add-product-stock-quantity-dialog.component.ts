import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';

import { ProductSourceEnum } from 'src/app/_enum/product-source.enum';

@Component({
  selector: 'app-add-product-stock-quantity-dialog',
  templateUrl: './add-product-stock-quantity-dialog.component.html',
  styleUrls: ['./add-product-stock-quantity-dialog.component.scss']
})
export class AddProductStockQuantityDialogComponent implements OnInit {

  private _productWithDrawalForm: FormGroup;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<AddProductStockQuantityDialogComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      additionalStockQuantity: number;
      transactionNo: string;
      productSource: ProductSourceEnum;
    },
    private formBuilder: FormBuilder,
    private translateService: TranslateService
  ) {
    this._productWithDrawalForm = this.formBuilder.group({
      transactionNo: [data.transactionNo],
      additionalStockQuantity: [data.additionalStockQuantity],
    });
  }

  ngOnInit() { }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onConfirm() {
    const additionalStockQuantity = this._productWithDrawalForm.get('additionalStockQuantity').value;
    const transactionNo = this._productWithDrawalForm.get('transactionNo').value;
    this._bottomSheetRef.dismiss({ additionalStockQuantity, transactionNo: transactionNo });
  }

  get productWithdrawalForm(): FormGroup {
    return this._productWithDrawalForm;
  }

  get dialogTitle(): string {
    return this.translateService.instant(this.data.productSource === ProductSourceEnum.Panel ? 'ADD_PRODUCT_STOCK_QUANTITY_DIALOG.FOR_PANEL.TITLE' : 'ADD_PRODUCT_STOCK_QUANTITY_DIALOG.FOR_WAREHOUSE.TITLE');
  }

  get fieldLabel(): string {
    return this.translateService.instant(this.data.productSource === ProductSourceEnum.Panel ? 'ADD_PRODUCT_STOCK_QUANTITY_DIALOG.FOR_PANEL.FORM_CONTROL_SECTION.TRANSACTION_NO' : 'ADD_PRODUCT_STOCK_QUANTITY_DIALOG.FOR_WAREHOUSE.FORM_CONTROL_SECTION.TRANSACTION_NO');
  }
}
