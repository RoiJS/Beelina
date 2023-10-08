import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { select, Store } from '@ngrx/store';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { barangaysSelector } from 'src/app/barangays/store/selectors';
import { customerStoresSelector } from 'src/app/customer/store/selectors';
import {
  productTransactionsSelector,
  transactionsSelector,
} from '../add-to-cart-product/store/selectors';

import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { StorageService } from 'src/app/_services/storage.service';
import { ProductService } from 'src/app/_services/product.service';

import { AddToCartProductComponent } from '../add-to-cart-product/add-to-cart-product.component';
import { SelectNewProductComponent } from './select-new-product/select-new-product.component';

import {
  Transaction,
  TransactionDto,
  TransactionService,
} from 'src/app/_services/transaction.service';

import * as BarangayActions from '../../barangays/store/actions';
import * as CustomerActions from '../../customer/store/actions';
import * as ProductActions from '../store/actions';
import * as ProductTransactionActions from '../add-to-cart-product/store/actions';

import { CustomerStore } from 'src/app/_models/customer-store';

import { NumberFormatter } from 'src/app/_helpers/formatters/number-formatter.helper';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';
import { Product } from 'src/app/_models/product';
import { ProductCartTransaction } from 'src/app/_models/product-cart-transaction.model';

import { Barangay } from 'src/app/_models/barangay';
import { ProductTransaction } from 'src/app/_models/transaction';
import { InsufficientProductQuantity } from 'src/app/_models/insufficient-product-quantity';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

@Component({
  selector: 'app-product-cart',
  templateUrl: './product-cart.component.html',
  styleUrls: ['./product-cart.component.scss'],
})
export class ProductCartComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  private _orderForm: FormGroup;
  private _customerStoreOptions: Array<CustomerStore> = [];
  private _customerStoreFilterOptions: Observable<Array<CustomerStore>>;

  private _barangayOptions: Array<Barangay> = [];
  private _barangayFilterOptions: Observable<Array<Barangay>>;

  private _subscription: Subscription = new Subscription();
  private _selectedCustomer: CustomerStore;
  private _selectedBarangay: Barangay;

  private _productTransactions: Array<ProductTransaction>;
  private _productCartTransactions: Array<ProductCartTransaction> =
    new Array<ProductCartTransaction>();
  private _totalAmount: number = 0;
  private _transaction: Transaction;
  private _transactionId: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private bottomSheet: MatBottomSheet,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
    private store: Store<AppStateInterface>,
    private transactionService: TransactionService,
    private translateService: TranslateService,
    private snackBarService: MatSnackBar,
    private storageService: StorageService,
    private productService: ProductService
  ) {
    super();
    this._orderForm = this.formBuilder.group({
      barangay: ['', Validators.required],
      name: ['', Validators.required],
      address: [''],
      paymentMethod: [''],
      dueDate: [null, Validators.required],
    });
  }

  ngOnInit() {
    const barangayControl = this._orderForm.get('barangay');
    const nameControl = this._orderForm.get('name');
    const addressControl = this._orderForm.get('address');
    const paymentMethodControl = this._orderForm.get('paymentMethod');

    nameControl.disable();
    addressControl.disable();
    paymentMethodControl.disable();

    this._transactionId = +this.activatedRoute.snapshot.paramMap.get('id');

    if (this._transactionId > 0) {
      this._isLoading = true;
      this.store.dispatch(
        ProductTransactionActions.getProductTransactionsFromServer({
          transactionId: this._transactionId,
        })
      );
      this._isLoading = false;
    } else {
      this.store.dispatch(
        ProductTransactionActions.initializeProductTransactions()
      );
    }

    this.store.dispatch(ProductActions.getProductsAction());
    this.store.dispatch(BarangayActions.getAllBarangayAction());
    this.store.dispatch(CustomerActions.getAllCustomerStoreAction());

    this._subscription.add(
      this.store
        .pipe(select(customerStoresSelector))
        .subscribe((customerStores: Array<CustomerStore>) => {
          this._customerStoreOptions = customerStores;
        })
    );

    this._subscription.add(
      this.store
        .pipe(select(barangaysSelector))
        .subscribe((barangays: Array<Barangay>) => {
          this._barangayOptions = barangays;
        })
    );

    this._subscription.add(
      this.store
        .pipe(select(productTransactionsSelector))
        .subscribe((productTransactions: Array<ProductTransaction>) => {
          this._productTransactions = productTransactions;

          if (this._transactionId === 0) {
            this.storageService.storeString(
              'productTransactions',
              JSON.stringify(this._productTransactions)
            );
          }

          if (
            this._productTransactions.length === 0 &&
            this._transactionId === 0
          ) {
            this.router.navigate(['/product-catalogue/product-list']);
          }

          this._totalAmount = this._productTransactions.reduce(
            (t, n) => t + n.price * n.quantity,
            0
          );
        })
    );

    this._subscription.add(
      this.store
        .pipe(select(transactionsSelector))
        .subscribe((transaction: Transaction) => {
          this._transaction = transaction;

          if (this._transaction.store) {
            this._orderForm
              .get('barangay')
              .setValue(this._transaction.store.barangay.name);
            this._orderForm.get('name').setValue(this._transaction.store.name);
            this._selectedCustomer = this._transaction.store;
            this._orderForm
              .get('address')
              .setValue(this._transaction.store.address);
            this._orderForm
              .get('paymentMethod')
              .setValue(this._transaction.store.paymentMethod.name);
            this._orderForm
              .get('dueDate')
              .setValue(this._transaction.transactionDate);
          }
        })
    );

    this._customerStoreFilterOptions = nameControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterCustomers(value || ''))
    );

    this._subscription.add(
      barangayControl.valueChanges.subscribe((value) => {
        nameControl.setValue('');

        this._selectedBarangay = this._barangayOptions.find(
          (c) => c.name === value
        );

        if (this._selectedBarangay) {
          nameControl.enable();
        } else {
          nameControl.disable();
        }
      })
    );

    this._barangayFilterOptions = barangayControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterBarangays(value || ''))
    );

    this._subscription.add(
      nameControl.valueChanges.subscribe((value) => {
        this._selectedCustomer = this._customerStoreOptions.find(
          (c) => c.name === value
        );

        addressControl.setValue('');
        paymentMethodControl.setValue('');

        if (this._selectedCustomer) {
          this._orderForm
            .get('address')
            .setValue(this._selectedCustomer.address);
          this._orderForm
            .get('paymentMethod')
            .setValue(this._selectedCustomer.paymentMethod.name);
          addressControl.enable();
          paymentMethodControl.enable();
        } else {
          addressControl.disable();
          paymentMethodControl.disable();
        }
      })
    );
  }

  // clear() {
  //   this.dialogService
  //     .openConfirmation(
  //       this.translateService.instant(
  //         'PRODUCT_CART_PAGE.CLEAR_ORDER_DIALOG.TITLE'
  //       ),
  //       this.translateService.instant(
  //         'PRODUCT_CART_PAGE.CLEAR_ORDER_DIALOG.CONFIRM'
  //       )
  //     )
  //     .subscribe((result: ButtonOptions) => {
  //       if (result === ButtonOptions.YES) {
  //         this.snackBarService.open(
  //           this.translateService.instant(
  //             'PRODUCT_CART_PAGE.CLEAR_ORDER_DIALOG.SUCCESS_MESSAGE'
  //           ),
  //           this.translateService.instant('GENERAL_TEXTS.CLOSE'),
  //           {
  //             duration: 5000,
  //           }
  //         );
  //         this.store.dispatch(
  //           ProductTransactionActions.setSaveOrderLoadingState({
  //             state: false,
  //           })
  //         );
  //         this.storageService.remove('productTransactions');
  //         this.store.dispatch(
  //           ProductTransactionActions.resetProductTransactionState()
  //         );
  //         this.router.navigate(['/product-catalogue']);
  //       }
  //     });
  // }

  saveAsDraft() {
    this._orderForm.markAllAsTouched();
    if (this._orderForm.valid) {
      const transaction = new TransactionDto();
      transaction.storeId = this._selectedCustomer.id;
      transaction.status = TransactionStatusEnum.DRAFT;
      transaction.transactionDate = DateFormatter.format(
        this._orderForm.get('dueDate').value
      );
      transaction.productTransactions = this._productTransactions;

      this.dialogService
        .openConfirmation(
          this.translateService.instant(
            'PRODUCT_CART_PAGE.SAVE_NEW_DRAFT_ORDER_DIALOG.TITLE'
          ),
          this.translateService.instant(
            'PRODUCT_CART_PAGE.SAVE_NEW_DRAFT_ORDER_DIALOG.CONFIRM'
          )
        )
        .subscribe((result: ButtonOptions) => {
          if (result === ButtonOptions.YES) {
            this.transactionService.registerTransaction(transaction).subscribe({
              next: () => {
                this.snackBarService.open(
                  this.translateService.instant(
                    'PRODUCT_CART_PAGE.SAVE_NEW_DRAFT_ORDER_DIALOG.SUCCESS_MESSAGE'
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
                    'PRODUCT_CART_PAGE.SAVE_NEW_DRAFT_ORDER_DIALOG.ERROR_MESSAGE'
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

  updateItemToCart(productId: number) {
    this.bottomSheet.open(AddToCartProductComponent, {
      data: { productId, productTransactions: this._productTransactions },
    });
  }

  confirm() {
    this.productService
      .validateProductionTransactionsQuantities(this._productTransactions)
      .subscribe(
        (insufficientProductQuantities: Array<InsufficientProductQuantity>) => {
          if (insufficientProductQuantities.length > 0) {
            let errorMessage = this.translateService.instant(
              'PRODUCT_CART_PAGE.INSUFFICIENT_PRODUCT_QUANTITY_DIALOG.MESSAGE'
            );

            insufficientProductQuantities.forEach((i) => {
              errorMessage += `* <strong>(${i.productCode})</strong> ${i.productName} <br>`;
            });

            this.dialogService.openAlert(
              this.translateService.instant(
                'PRODUCT_CART_PAGE.INSUFFICIENT_PRODUCT_QUANTITY_DIALOG.TITLE'
              ),
              errorMessage
            );

            return;
          }

          this._orderForm.markAllAsTouched();
          if (this._orderForm.valid) {
            const transaction = new TransactionDto();
            transaction.id = this._transactionId;
            transaction.storeId = this._selectedCustomer.id;
            transaction.status = TransactionStatusEnum.CONFIRMED;
            transaction.transactionDate = DateFormatter.format(
              this._orderForm.get('dueDate').value
            );
            transaction.productTransactions = this._productTransactions;

            this.dialogService
              .openConfirmation(
                this.translateService.instant(
                  'PRODUCT_CART_PAGE.SAVE_NEW_CONFIRMED_ORDER_DIALOG.TITLE'
                ),
                this.translateService.instant(
                  'PRODUCT_CART_PAGE.SAVE_NEW_CONFIRMED_ORDER_DIALOG.CONFIRM'
                )
              )
              .subscribe((result: ButtonOptions) => {
                if (result === ButtonOptions.YES) {
                  this.transactionService
                    .registerTransaction(transaction)
                    .subscribe({
                      next: () => {
                        this.snackBarService.open(
                          this.translateService.instant(
                            'PRODUCT_CART_PAGE.SAVE_NEW_CONFIRMED_ORDER_DIALOG.SUCCESS_MESSAGE'
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

                        if (this._transactionId === 0) {
                          this.router.navigate(['/product-catalogue']);
                        } else {
                          this.router.navigate(['/draft-transactions']);
                        }
                      },

                      error: () => {
                        this.snackBarService.open(
                          this.translateService.instant(
                            'PRODUCT_CART_PAGE.SAVE_NEW_CONFIRMED_ORDER_DIALOG.ERROR_MESSAGE'
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
      );
  }

  addINewtemToCart() {
    this.bottomSheet.open(SelectNewProductComponent, {
      data: { productTransactions: this._productTransactions },
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
    this.store.dispatch(CustomerActions.resetCustomerState());
    this.store.dispatch(BarangayActions.resetBarangayState());
    this.store.dispatch(ProductTransactionActions.resetTransactionState());
  }

  private _filterCustomers(value: string): Array<CustomerStore> {
    const filterValue = value?.toLowerCase();
    const currentBarangay = this._orderForm.get('barangay').value.toLowerCase();
    return this._customerStoreOptions.filter((option) => {
      return (
        option.barangay?.name.toLowerCase().includes(currentBarangay) &&
        option.name?.toLowerCase().includes(filterValue)
      );
    });
  }

  private _filterBarangays(value: string): Array<Barangay> {
    const filterValue = value?.toLowerCase();
    return this._barangayOptions.filter((option) =>
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

  get barangayFilterOptions(): Observable<Array<Barangay>> {
    return this._barangayFilterOptions;
  }

  get totalAmount(): string {
    return NumberFormatter.formatCurrency(this._totalAmount);
  }

  get minDate(): Date {
    return new Date();
  }

  get isDraftTransaction(): boolean {
    return this._transactionId > 0;
  }

  get barangayOptions(): Array<Barangay> {
    return this._barangayOptions;
  }
}
