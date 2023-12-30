import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import * as ProductActions from '../store/actions';
import { Product } from 'src/app/_models/product';
import { ProductTransaction } from 'src/app/_models/transaction';
import { productTransactionsSelector } from '../add-to-cart-product/store/selectors';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';

import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { StorageService } from 'src/app/_services/storage.service';
import { AuthService } from 'src/app/_services/auth.service';
import { ProductService } from 'src/app/_services/product.service';

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
    private authService: AuthService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private store: Store<AppStateInterface>,
    private translateService: TranslateService,
    private storageService: StorageService,
    private snackBarService: MatSnackBar,
    private productService: ProductService
  ) {
    this._orderForm = this.formBuilder.group({
      textOrder: ['', Validators.required],
    });

    if (storageService.hasKey("textOrder")) {
      this._orderForm.get('textOrder').setValue(storageService.getString("textOrder"));
    }

    this._subscription.add(this._orderForm.get('textOrder')
      .valueChanges
      .subscribe((value: string) => {
        storageService.storeString("textOrder", value);
      }));

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
          this.storageService.storeString(
            'productTransactions',
            JSON.stringify(productTransactions)
          );
          this._hasActiveOrders = productTransactions.length > 0;
        })
    );

    this.productService
      .getProductDetailList(this.authService.userId)
      .subscribe((productList: Array<Product>) => {
        this._productList = productList;
      });
  }

  ngOnInit() { }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  refreshList() {
    this.productService
      .getProductDetailList(this.authService.userId)
      .subscribe((productList: Array<Product>) => {
        this.snackBarService.open(
          this.translateService.instant(
            'PRODUCTS_CATALOGUE_PAGE.TEXT_ORDER_DIALOG.REFRESH_PRODUCT_LIST_ERROR_MESSAGE'
          ),
          this.translateService.instant('GENERAL_TEXTS.CLOSE')
        )
        this._productList = productList;
      });
  }

  setOrder() {
    const textOrders = this._orderForm.get('textOrder').value;
    this.store.dispatch(ProductActions.analyzeTextOrders({ textOrders }));
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

  findChoices = (searchText: string) => {
    return this._productList.filter(item =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code.toLowerCase().includes(searchText.toLowerCase()) ||
      item.productUnit.name.toLowerCase().includes(searchText.toLowerCase())
    ).map(
      product => `${product.code} : ${product.name} : ${product.productUnit.name}`
    );
  }

  getChoiceLabel(choice: string) {
    return choice.trim().split(":")[0].trim();
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
}
