import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { select, Store } from '@ngrx/store';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { customerStoresSelector } from 'src/app/customer/store/selectors';
import { productTransactionsSelector } from '../add-to-cart-product/store/selectors';
import { Router } from '@angular/router';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { StorageService } from 'src/app/_services/storage.service';

import {
  TransactionDto,
  TransactionService,
} from 'src/app/_services/transaction.service';

import * as CustomerActions from '../../customer/store/actions';
import * as ProductTransactionActions from '../add-to-cart-product/store/actions';

import { NumberFormatter } from 'src/app/_helpers/formatters/number-formatter.helper';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';
import { CustomerStore } from 'src/app/_models/customer-store';
import { Product } from 'src/app/_models/product';
import { ProductTransaction } from 'src/app/_models/transaction';

export class ProductCartTransaction {
  public productName: string;
  public quantity: number;
  public price: number;

  get totalFormatted(): string {
    return NumberFormatter.formatCurrency(this?.total);
  }

  get priceFormatted(): string {
    return NumberFormatter.formatCurrency(this?.price);
  }

  get total(): number {
    return this.quantity * this.price;
  }
}

@Component({
  selector: 'app-product-cart',
  templateUrl: './product-cart.component.html',
  styleUrls: ['./product-cart.component.scss'],
})
export class ProductCartComponent implements OnInit, OnDestroy {
  private _orderForm: FormGroup;
  private _customerStoreOptions: Array<CustomerStore> = [];
  private _customerStoreFilterOptions: Observable<Array<CustomerStore>>;
  private _subscription: Subscription = new Subscription();
  private _selectedCustomer: CustomerStore;
  private _products: Array<Product>;
  private _productTransactions: Array<ProductTransaction>;
  private _productCartTransactions: Array<ProductCartTransaction> =
    new Array<ProductCartTransaction>();
  private _totalAmount: number = 0;

  constructor(
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
    private store: Store<AppStateInterface>,
    private transactionService: TransactionService,
    private translateService: TranslateService,
    private snackBarService: MatSnackBar,
    private storageService: StorageService
  ) {
    this._orderForm = this.formBuilder.group({
      name: ['', Validators.required],
      address: [''],
      paymentMethod: [''],
      dueDate: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.store.dispatch(CustomerActions.getAllCustomerStoreAction());
    this.store.dispatch(
      ProductTransactionActions.initializeProductTransactions()
    );

    this._subscription.add(
      this.store
        .pipe(select(customerStoresSelector))
        .subscribe((customerStores: Array<CustomerStore>) => {
          this._customerStoreOptions = customerStores;
        })
    );

    this._subscription.add(
      this.store
        .pipe(select(productTransactionsSelector))
        .subscribe((productTransactions: Array<ProductTransaction>) => {
          this._productTransactions = productTransactions;

          this._totalAmount = this._productTransactions.reduce(
            (t, n) => t + n.price * n.quantity,
            0
          );
        })
    );

    this._customerStoreFilterOptions = this._orderForm
      .get('name')
      .valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(value || ''))
      );

    this._orderForm.get('name').valueChanges.subscribe((value) => {
      this._selectedCustomer = this._customerStoreOptions.find(
        (c) => c.name === value
      );

      if (this._selectedCustomer) {
        this._orderForm.get('address').setValue(this._selectedCustomer.address);
        this._orderForm
          .get('paymentMethod')
          .setValue(this._selectedCustomer.paymentMethod.name);
      }
    });
  }

  clear() {
    this.dialogService
      .openConfirmation(
        this.translateService.instant(
          'PRODUCT_CART_PAGE.CLEAR_ORDER_DIALOG.TITLE'
        ),
        this.translateService.instant(
          'PRODUCT_CART_PAGE.CLEAR_ORDER_DIALOG.CONFIRM'
        )
      )
      .subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this.snackBarService.open(
            this.translateService.instant(
              'PRODUCT_CART_PAGE.CLEAR_ORDER_DIALOG.SUCCESS_MESSAGE'
            ),
            this.translateService.instant('GENERAL_TEXTS.CLOSE'),
            {
              duration: 5000,
            }
          );
          this.store.dispatch(
            ProductTransactionActions.setSaveOrderLoadingState({
              state: false,
            })
          );
          this.storageService.remove('productTransactions');
          this.store.dispatch(
            ProductTransactionActions.resetProductTransactionState()
          );
          this.router.navigate(['/product-catalogue']);
        }
      });
  }

  confirm() {
    this._orderForm.markAllAsTouched();
    if (this._orderForm.valid) {
      const transaction = new TransactionDto();
      transaction.storeId = this._selectedCustomer.id;
      transaction.transactionDate = DateFormatter.format(
        this._orderForm.get('dueDate').value
      );
      transaction.productTransactions = this._productTransactions;

      this.dialogService
        .openConfirmation(
          this.translateService.instant(
            'PRODUCT_CART_PAGE.SAVE_NEW_ORDER_DIALOG.TITLE'
          ),
          this.translateService.instant(
            'PRODUCT_CART_PAGE.SAVE_NEW_ORDER_DIALOG.CONFIRM'
          )
        )
        .subscribe((result: ButtonOptions) => {
          if (result === ButtonOptions.YES) {
            this.transactionService.registerTransaction(transaction).subscribe({
              next: () => {
                this.snackBarService.open(
                  this.translateService.instant(
                    'PRODUCT_CART_PAGE.SAVE_NEW_ORDER_DIALOG.SUCCESS_MESSAGE'
                  ),
                  this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                  {
                    duration: 5000,
                  }
                );
                this.store.dispatch(
                  ProductTransactionActions.setSaveOrderLoadingState({
                    state: false,
                  })
                );
                this.storageService.remove('productTransactions');
                this.store.dispatch(
                  ProductTransactionActions.resetProductTransactionState()
                );

                this.router.navigate(['/product-catalogue']);
              },

              error: () => {
                this.snackBarService.open(
                  this.translateService.instant(
                    'PRODUCT_CART_PAGE.SAVE_NEW_ORDER_DIALOG.ERROR_MESSAGE'
                  ),
                  this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                  {
                    duration: 5000,
                  }
                );

                this.store.dispatch(
                  ProductTransactionActions.setSaveOrderLoadingState({
                    state: false,
                  })
                );
              },
            });
          }
        });
    }
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
    this.store.dispatch(CustomerActions.resetCustomerState());
  }

  private _filter(value: string): Array<CustomerStore> {
    const filterValue = value?.toLowerCase();
    return this._customerStoreOptions.filter((option) =>
      option.name?.toLowerCase().includes(filterValue)
    );
  }

  get orderForm(): FormGroup {
    return this._orderForm;
  }

  get productCartTransactions(): Array<ProductCartTransaction> {
    return this._productCartTransactions;
  }

  get productTransactions(): Array<ProductTransaction> {
    return this._productTransactions;
  }

  get customerStoreFilterOptions(): Observable<Array<CustomerStore>> {
    return this._customerStoreFilterOptions;
  }

  get totalAmount(): string {
    return NumberFormatter.formatCurrency(this._totalAmount);
  }

  get minDate(): Date {
    return new Date();
  }
}
