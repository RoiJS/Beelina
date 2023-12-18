import { Router } from '@angular/router';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import * as ProductActions from '../store/actions';
import { Product } from 'src/app/_models/product';

@Component({
  selector: 'app-text-order',
  templateUrl: './text-order.component.html',
  styleUrls: ['./text-order.component.scss'],
})
export class TextOrderComponent implements OnInit {
  private _productList: Array<Product> = [];
  private _orderForm: FormGroup;
  private _hintLabelText1: string;
  private _hintLabelText2: string;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<TextOrderComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      productList: Array<Product>;
    },
    private formBuilder: FormBuilder,
    private router: Router,
    private store: Store<AppStateInterface>,
    private translateService: TranslateService,
  ) {
    this._orderForm = this.formBuilder.group({
      textOrder: ['', Validators.required],
    });

    this._hintLabelText1 = this.translateService.instant(
      'TEXT_ORDER_DIALOG.FORM_CONTROL_SECTION.TEXT_ORDER_CONTROL.HINT_LABEL_1'
    );
    this._hintLabelText2 = this.translateService.instant(
      'TEXT_ORDER_DIALOG.FORM_CONTROL_SECTION.TEXT_ORDER_CONTROL.HINT_LABEL_2'
    );

    this._productList = data.productList;
  }

  ngOnInit() { }

  setOrder() {
    const textOrders = this._orderForm.get('textOrder').value;
    this.store.dispatch(ProductActions.analyzeTextOrders({ textOrders }));
    setTimeout(() => {
      this.router.navigate([`product-catalogue/product-cart`]);
      this._bottomSheetRef.dismiss();
    }, 1000);
  }

  findChoices(searchText: string, choices: string[]) {
    return choices.filter(item =>
      item.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  getChoiceLabel(choice: string) {
    return choice.trim().split("-")[0].trim();
  }

  get orderForm(): FormGroup {
    return this._orderForm;
  }

  get hintLabelText1() {
    return this._hintLabelText1;
  }

  get hintLabelText2() {
    return this._hintLabelText2;
  }

  get productList(): Array<any> {
    return this._productList.map(product => `${product.code} - ${product.name}`);
  }
}
