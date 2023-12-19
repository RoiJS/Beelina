import { Router } from '@angular/router';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import * as ProductActions from '../store/actions';
import { Product } from 'src/app/_models/product';
import { ProductTransaction } from 'src/app/_models/transaction';
import { productTransactionsSelector } from '../add-to-cart-product/store/selectors';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';

@Component({
  selector: 'app-text-order',
  templateUrl: './text-order.component.html',
  styleUrls: ['./text-order.component.scss'],
})
export class TextOrderComponent implements OnInit, OnDestroy {
  private _subscription: Subscription = new Subscription();
  private _productList: Array<Product> = [];
  private _orderForm: FormGroup;
  private _hintLabelText1: string;
  private _hintLabelText2: string;
  private _hasActiveOrders: boolean;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<TextOrderComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      productList: Array<Product>;
    },
    private dialogService: DialogService,
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

    this._subscription.add(
      this.store
        .pipe(select(productTransactionsSelector))
        .subscribe((productTransactions: Array<ProductTransaction>) => {
          this._hasActiveOrders = productTransactions.length > 0;
        })
    );

    this._productList = data.productList;
  }

  ngOnInit() { }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  setOrder() {
    const textOrders = this._orderForm.get('textOrder').value;
    this.store.dispatch(ProductActions.analyzeTextOrders({ textOrders }));
    setTimeout(() => {
      this.router.navigate([`product-catalogue/product-cart`]);
      this._bottomSheetRef.dismiss();
    }, 1000);
  }

  confirmOrders() {
    if (this._hasActiveOrders) {
      this.dialogService.openConfirmation(
        this.translateService.instant(
          'TEXT_ORDER_DIALOG.CONFIRM_ORDERS_DIALOG.TITLE',
        ),
        this.translateService.instant(
          'TEXT_ORDER_DIALOG.CONFIRM_ORDERS_DIALOG.CONFIRM_MESSAGE',
        )
      ).subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this.setOrder();
        }
      })
    } else {
      this.setOrder();
    }
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
