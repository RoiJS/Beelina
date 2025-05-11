import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { Store } from '@ngrx/store';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { ProductInformationResult } from 'src/app/_models/results/product-information-result';


import * as ProductTransactionActions from './store/actions';
import * as ProductActions from './../store/actions';

import { Product } from 'src/app/_models/product';
import { ProductTransaction } from 'src/app/_models/transaction';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { ProductDataService } from 'src/app/_services/product-data.service';

@Component({
  selector: 'app-add-to-cart-product',
  templateUrl: './add-to-cart-product.component.html',
  styleUrls: ['./add-to-cart-product.component.scss'],
})
export class AddToCartProductComponent extends BaseComponent implements OnInit {
  private _product: Product;
  private _productTransaction: ProductTransaction;
  private _itemCounterForm: FormGroup;
  private _productTransactions: Array<ProductTransaction>;
  private _invalidValue: boolean;

  private _bottomSheetRef = inject(MatBottomSheetRef<AddToCartProductComponent>);
  private formBuilder = inject(FormBuilder);
  private store = inject(Store<AppStateInterface>);
  private productDataService = inject(ProductDataService);

  data = inject<{
    productId: number;
    productTransactions: Array<ProductTransaction>;
  }>(MAT_BOTTOM_SHEET_DATA);

  constructor() {
    super();
    this._productTransactions = this.data.productTransactions;

    this._itemCounterForm = this.formBuilder.group({
      itemCounter: [0],
    });

    this._isLoading = true;
    this.productDataService
      .getProduct(this.data.productId)
      .subscribe((result: ProductInformationResult) => {
        this._isLoading = false;
        this._product = new Product();
        this._product.id = result.id;
        this._product.code = result.code;
        this._product.name = result.name;
        this._product.description = result.description;
        this._product.stockQuantity = result.stockQuantity;
        this._product.price = result.pricePerUnit;
        this._product.productUnit.name = result.productUnit.name;

        this._productTransaction = this._productTransactions.find(
          (p) => p.productId === this.data.productId
        );

        if (this._productTransaction) {
          this._itemCounterForm
            .get('itemCounter')
            .setValue(this._productTransaction.quantity);
        }
      });

    this._itemCounterForm.get('itemCounter').valueChanges.subscribe((value) => {
      this._invalidValue = value > this._product.stockQuantity;
    });
  }

  ngOnInit() { }

  onConfirm() {
    let currentValue = this._itemCounterForm.get('itemCounter').value;
    this.setItem(currentValue);
    this._bottomSheetRef.dismiss();
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  deductItem() {
    let currentValue = this._itemCounterForm.get('itemCounter').value;
    currentValue -= 1;

    if (currentValue >= 0) {
      this._itemCounterForm.get('itemCounter').setValue(currentValue);
    }
  }

  addItem() {
    let currentValue = this._itemCounterForm.get('itemCounter').value;
    currentValue += 1;
    this._itemCounterForm.get('itemCounter').setValue(currentValue);
  }

  private setItem(currentValue: number) {
    this.store.dispatch(
      ProductTransactionActions.selectProduct({
        code: this._product.code,
        productId: this._product.id,
        price: this._product.price,
        quantity: currentValue,
        name: this._product.name,
      })
    );

    this.store.dispatch(
      ProductActions.setProductDeductionAction({
        deduction: currentValue,
        productId: this._product.id,
      })
    );
  }

  get product(): Product {
    return this._product;
  }

  get itemCounterForm(): FormGroup {
    return this._itemCounterForm;
  }

  get invalidValue(): boolean {
    return this._invalidValue;
  }
}
