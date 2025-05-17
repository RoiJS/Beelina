import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  private _bottomSheetRef = inject(MatBottomSheetRef<AddProductStockQuantityDialogComponent>);
  private _formBuilder = inject(FormBuilder);
  private _translateService = inject(TranslateService);

  data = inject<{
    additionalStockQuantity: number;
    transactionNo: string;
    productSource: ProductSourceEnum;
  }>(MAT_BOTTOM_SHEET_DATA);

  constructor() {
    this._productWithDrawalForm = this._formBuilder.group({
      transactionNo: [this.data.transactionNo, [Validators.required]],
      additionalStockQuantity: [this.data.additionalStockQuantity],
      senderPlateNo: [''],
    });
  }

  ngOnInit() { }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onConfirm() {
    this._productWithDrawalForm.markAllAsTouched();

    if (!this._productWithDrawalForm.valid) return;

    const additionalStockQuantity = this._productWithDrawalForm.get('additionalStockQuantity').value;
    const transactionNo = this._productWithDrawalForm.get('transactionNo').value;
    const plateNo = this._productWithDrawalForm.get('senderPlateNo').value;

    this._bottomSheetRef.dismiss({ additionalStockQuantity, transactionNo, plateNo });
  }

  get productWithdrawalForm(): FormGroup {
    return this._productWithDrawalForm;
  }

  get dialogTitle(): string {
    return this._translateService.instant(this.data.productSource === ProductSourceEnum.Panel ? 'ADD_PRODUCT_STOCK_QUANTITY_DIALOG.FOR_PANEL.TITLE' : 'ADD_PRODUCT_STOCK_QUANTITY_DIALOG.FOR_WAREHOUSE.TITLE');
  }

  get fieldLabel(): string {
    return this._translateService.instant(this.data.productSource === ProductSourceEnum.Panel ? 'ADD_PRODUCT_STOCK_QUANTITY_DIALOG.FOR_PANEL.FORM_CONTROL_SECTION.TRANSACTION_NO' : 'ADD_PRODUCT_STOCK_QUANTITY_DIALOG.FOR_WAREHOUSE.FORM_CONTROL_SECTION.TRANSACTION_NO');
  }
}
