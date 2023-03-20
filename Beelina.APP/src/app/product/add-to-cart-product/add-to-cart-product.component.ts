import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { select, Store } from '@ngrx/store';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { ProductInformationResult } from 'src/app/_models/results/product-information-result';

import { ProductService } from 'src/app/_services/product.service';
import { StorageService } from 'src/app/_services/storage.service';

import { productTransactionsSelector } from './store/selectors';
import * as ProductTransactionActions from './store/actions';
import * as ProductActions from './../store/actions';

import { Product } from 'src/app/_models/product';
import { ProductTransaction } from 'src/app/_models/transaction';

@Component({
  selector: 'app-add-to-cart-product',
  templateUrl: './add-to-cart-product.component.html',
  styleUrls: ['./add-to-cart-product.component.scss'],
})
export class AddToCartProductComponent implements OnInit {
  private _product: Product;
  private _productTransaction: ProductTransaction;
  private _itemCounterForm: FormGroup;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<AddToCartProductComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { id: number },
    private formBuilder: FormBuilder,
    private store: Store<AppStateInterface>,
    private productService: ProductService,
    private storageService: StorageService
  ) {
    this._itemCounterForm = this.formBuilder.group({
      itemCounter: [0, Validators.maxLength(100)],
    });

    this.productService
      .getProduct(data.id)
      .subscribe((result: ProductInformationResult) => {
        this._product = new Product();
        this._product.id = result.id;
        this._product.code = result.code;
        this._product.name = result.name;
        this._product.description = result.description;
        this._product.stockQuantity = result.stockQuantity;
        this._product.price = result.pricePerUnit;
        this._product.productUnit.name = result.productUnit.name;

        this.store
          .pipe(select(productTransactionsSelector))
          .subscribe((productTransactions: Array<ProductTransaction>) => {
            this.storageService.storeString(
              'productTransactions',
              JSON.stringify(productTransactions)
            );
            this._productTransaction = productTransactions.find(
              (p) => p.productId === data.id
            );

            if (this._productTransaction) {
              this._itemCounterForm
                .get('itemCounter')
                .setValue(this._productTransaction.quantity);
            }
          });
      });
  }

  ngOnInit() {}

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

    if (currentValue <= this._product.stockQuantity) {
      this._itemCounterForm.get('itemCounter').setValue(currentValue);
    }
  }

  private setItem(currentValue: number) {
    this.store.dispatch(
      ProductTransactionActions.selectProduct({
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
}
