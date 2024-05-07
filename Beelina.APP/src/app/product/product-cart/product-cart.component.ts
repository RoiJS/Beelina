import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { barangaysSelector } from 'src/app/barangays/store/selectors';
import { customerStoresSelector } from 'src/app/customer/store/selectors';
import {
  productTransactionsSelector,
  transactionsSelector,
} from '../add-to-cart-product/store/selectors';

import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { StorageService } from 'src/app/_services/storage.service';
import { ProductService } from 'src/app/_services/product.service';

import { AddToCartProductComponent } from '../add-to-cart-product/add-to-cart-product.component';
import { AgreementConfirmationComponent } from './agreement-confirmation/agreement-confirmation.component';
import { LoaderLayoutComponent } from 'src/app/shared/ui/loader-layout/loader-layout.component';
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
import * as PaymentMethodActions from '../../payment-methods/store/actions';

import { CustomerStore } from 'src/app/_models/customer-store';

import { NumberFormatter } from 'src/app/_helpers/formatters/number-formatter.helper';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';
import { ProductCartTransaction } from 'src/app/_models/product-cart-transaction.model';

import { Barangay } from 'src/app/_models/barangay';
import { ProductTransaction } from 'src/app/_models/transaction';
import { InsufficientProductQuantity } from 'src/app/_models/insufficient-product-quantity';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { PaymentMethod } from 'src/app/_models/payment-method';
import { paymentMethodsSelector } from 'src/app/payment-methods/store/selectors';
import { ITransactionPayload } from 'src/app/_interfaces/payloads/itransaction.payload';

@Component({
  selector: 'app-product-cart',
  templateUrl: './product-cart.component.html',
  styleUrls: ['./product-cart.component.scss'],
})
export class ProductCartComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  @ViewChild(LoaderLayoutComponent) loaderLayoutComponent: LoaderLayoutComponent;
  private _orderForm: FormGroup;
  private _discountForm: FormGroup;
  private _customerStoreOptions: Array<CustomerStore> = [];

  private _barangayOptions: Array<Barangay> = [];
  private _paymentMethodOptions: Array<PaymentMethod> = [];

  private _subscription: Subscription = new Subscription();
  private _selectedCustomer: CustomerStore;
  private _selectedBarangay: Barangay;

  private _productTransactions: Array<ProductTransaction>;
  private _productCartTransactions: Array<ProductCartTransaction> =
    new Array<ProductCartTransaction>();
  private _totalAmount: number = 0;
  private _transaction: Transaction;
  private _transactionId: number = 0;

  private _saveDraftTitle = '';
  private _saveDraftConfirmMessage = '';
  private _saveDraftLoadingMessage = '';
  private _saveDraftSuccessMessage = '';
  private _saveDraftErrorMessage = '';

  private _dialogRef: MatBottomSheetRef<AgreementConfirmationComponent>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private bottomSheet: MatBottomSheet,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
    private store: Store<AppStateInterface>,
    private transactionService: TransactionService,
    private translateService: TranslateService,
    private notificationService: NotificationService,
    private storageService: StorageService,
    private productService: ProductService
  ) {
    super();
    this._orderForm = this.formBuilder.group({
      invoiceNo: ['', Validators.required],
      barangay: ['', Validators.required],
      name: ['', Validators.required],
      address: [''],
      paymentMethod: [0, Validators.required],
      transactionDate: [new Date(), Validators.required],
      dueDate: [new Date(), Validators.required],
    });

    this._discountForm = this.formBuilder.group({
      discount: [0],
    });
  }

  ngOnInit() {
    const barangayControl = this._orderForm.get('barangay');
    const nameControl = this._orderForm.get('name');
    const addressControl = this._orderForm.get('address');
    const paymentMethodControl = this._orderForm.get('paymentMethod');

    nameControl.disable();
    addressControl.disable();
    // paymentMethodControl.disable();

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
    this.store.dispatch(PaymentMethodActions.getPaymentMethodsAction());

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

    this._subscription.add(this.store
      .pipe(select(paymentMethodsSelector))
      .subscribe((paymentMethods: Array<PaymentMethod>) => {
        this._paymentMethodOptions = paymentMethods;
      }));

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
              .get('invoiceNo')
              .setValue(this._transaction.invoiceNo);
            this._discountForm
              .get('discount')
              .setValue(this._transaction.discount || 0);
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
              .setValue(this._transaction.modeOfPayment);
            this._orderForm
              .get('transactionDate')
              .setValue(this._transaction.transactionDate || new Date());
            this._orderForm
              .get('dueDate')
              .setValue(this._transaction.dueDate || new Date());
          }
        })
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

    this._subscription.add(
      nameControl.valueChanges.subscribe((value) => {
        this._selectedCustomer = this._customerStoreOptions.find(
          (c) => c.name === value
        );

        addressControl.setValue('');
        paymentMethodControl.setValue(0);

        if (this._selectedCustomer) {
          this._orderForm
            .get('address')
            .setValue(this._selectedCustomer.address);
          this._orderForm
            .get('paymentMethod')
            .setValue(this._selectedCustomer.paymentMethod.id);
          addressControl.enable();
        } else {
          addressControl.disable();
        }
      })
    );
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
          this.notificationService.openSuccessNotification(this.translateService.instant(
            'PRODUCT_CART_PAGE.CLEAR_ORDER_DIALOG.SUCCESS_MESSAGE'
          ));
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

  saveExistingOrderAsDraft() {
    this._saveDraftTitle = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_EXISTING_DRAFT_ORDER_DIALOG.TITLE');
    this._saveDraftConfirmMessage = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_EXISTING_DRAFT_ORDER_DIALOG.CONFIRM');
    this._saveDraftLoadingMessage = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_EXISTING_DRAFT_ORDER_DIALOG.LOADING_MESSAGE');
    this._saveDraftSuccessMessage = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_EXISTING_DRAFT_ORDER_DIALOG.SUCCESS_MESSAGE');
    this._saveDraftErrorMessage = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_EXISTING_DRAFT_ORDER_DIALOG.ERROR_MESSAGE');
    this.saveAsDraft();
  }

  saveNewOrderAsDraft() {
    this._saveDraftTitle = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_DRAFT_ORDER_DIALOG.TITLE');
    this._saveDraftConfirmMessage = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_DRAFT_ORDER_DIALOG.CONFIRM');
    this._saveDraftLoadingMessage = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_DRAFT_ORDER_DIALOG.LOADING_MESSAGE');
    this._saveDraftSuccessMessage = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_DRAFT_ORDER_DIALOG.SUCCESS_MESSAGE');
    this._saveDraftErrorMessage = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_DRAFT_ORDER_DIALOG.ERROR_MESSAGE');
    this.saveAsDraft();
  }

  saveAsDraft() {
    this._orderForm.markAllAsTouched();
    if (this._orderForm.valid) {
      const transaction = new TransactionDto();
      transaction.id = this._transactionId;
      transaction.storeId = this._selectedCustomer.id;
      transaction.status = TransactionStatusEnum.DRAFT;
      transaction.modeOfPayment = this._orderForm.get('paymentMethod').value;
      transaction.invoiceNo = this._orderForm.get('invoiceNo').value;
      transaction.discount = this._discountForm.get('discount').value;
      transaction.transactionDate = DateFormatter.format(
        this._orderForm.get('transactionDate').value
      );
      transaction.dueDate = DateFormatter.format(
        this._orderForm.get('dueDate').value
      );
      transaction.productTransactions = this._productTransactions;

      this.dialogService
        .openConfirmation(
          this._saveDraftTitle,
          this._saveDraftConfirmMessage
        )
        .subscribe((result: ButtonOptions) => {
          if (result === ButtonOptions.YES) {
            this._isLoading = true;
            this.loaderLayoutComponent.label = this._saveDraftLoadingMessage;
            this.transactionService
              .registerTransaction(transaction)
              .subscribe({
                next: () => {
                  this._isLoading = false;
                  this.notificationService.openSuccessNotification(this._saveDraftSuccessMessage);
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
                  this._isLoading = false;
                  this.notificationService.openErrorNotification(this._saveDraftErrorMessage);

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

  saveAsBadOrder() {
    this._orderForm.markAllAsTouched();
    if (this._orderForm.valid) {
      const transaction = new TransactionDto();
      transaction.id = this._transactionId;
      transaction.storeId = this._selectedCustomer.id;
      transaction.status = TransactionStatusEnum.BAD_ORDER;
      transaction.modeOfPayment = this._orderForm.get('paymentMethod').value;
      transaction.invoiceNo = this._orderForm.get('invoiceNo').value;
      transaction.discount = this._discountForm.get('discount').value;
      transaction.transactionDate = DateFormatter.format(
        this._orderForm.get('transactionDate').value
      );
      transaction.dueDate = DateFormatter.format(
        this._orderForm.get('dueDate').value
      );
      transaction.productTransactions = this._productTransactions;

      this.dialogService
        .openConfirmation(
          this.translateService.instant(
            'PRODUCT_CART_PAGE.SAVE_NEW_BAD_ORDER_DIALOG.TITLE'
          ),
          this.translateService.instant(
            'PRODUCT_CART_PAGE.SAVE_NEW_BAD_ORDER_DIALOG.CONFIRM'
          )
        )
        .subscribe((result: ButtonOptions) => {
          if (result === ButtonOptions.YES) {
            this._isLoading = true;
            this.loaderLayoutComponent.label = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_BAD_ORDER_DIALOG.LOADING_MESSAGE');
            this.transactionService.registerTransaction(transaction).subscribe({
              next: () => {
                this._isLoading = false;
                this.notificationService.openSuccessNotification(this.translateService.instant(
                  'PRODUCT_CART_PAGE.SAVE_NEW_BAD_ORDER_DIALOG.SUCCESS_MESSAGE'
                ));
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
                this._isLoading = false;
                this.notificationService.openErrorNotification(this.translateService.instant(
                  'PRODUCT_CART_PAGE.SAVE_NEW_BAD_ORDER_DIALOG.ERROR_MESSAGE'
                ));

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
    this._orderForm.markAllAsTouched();
    if (!this._orderForm.valid) return;

    this._isLoading = true;
    this.loaderLayoutComponent.label = this.translateService.instant('PRODUCT_CART_PAGE.INSUFFICIENT_PRODUCT_QUANTITY_DIALOG.LOADING_MESSAGE');
    this.productService
      .validateProductionTransactionsQuantities(this._productTransactions)
      .subscribe(
        (insufficientProductQuantities: Array<InsufficientProductQuantity>) => {
          this._isLoading = false;
          if (insufficientProductQuantities.length > 0) {
            let errorMessage = this.translateService.instant(
              'PRODUCT_CART_PAGE.INSUFFICIENT_PRODUCT_QUANTITY_DIALOG.MESSAGE'
            );

            insufficientProductQuantities.forEach((i) => {
              errorMessage += `- <strong>(${i.productCode})</strong> ${i.productName} <br>`;
            });

            this.dialogService.openAlert(
              this.translateService.instant(
                'PRODUCT_CART_PAGE.INSUFFICIENT_PRODUCT_QUANTITY_DIALOG.TITLE'
              ),
              errorMessage
            );

            return;
          }

          this._dialogRef = this.bottomSheet.open(AgreementConfirmationComponent);

          this._dialogRef
            .afterDismissed()
            .subscribe(
              (data: {
                confirm: boolean;
              }) => {
                if (!data) return;

                if (data.confirm) {
                  this.proceedConfirm();
                }
              }
            );
        }
      );
  }

  addINewtemToCart() {
    this.bottomSheet.open(SelectNewProductComponent, {
      data: { productTransactions: this._productTransactions },
    });
  }

  ngOnDestroy() {
    this._dialogRef = null;
    this._subscription.unsubscribe();
    this.store.dispatch(CustomerActions.resetCustomerState());
    this.store.dispatch(BarangayActions.resetBarangayState());
    this.store.dispatch(ProductTransactionActions.resetTransactionState());
  }

  private proceedConfirm() {
    const transaction = new TransactionDto();
    transaction.id = this._transactionId;
    transaction.invoiceNo = this._orderForm.get('invoiceNo').value;
    transaction.discount = this._discountForm.get('discount').value;
    transaction.storeId = this._selectedCustomer.id;
    transaction.status = TransactionStatusEnum.CONFIRMED;
    transaction.modeOfPayment = this._orderForm.get('paymentMethod').value;
    transaction.transactionDate = DateFormatter.format(
      this._orderForm.get('transactionDate').value
    );
    transaction.dueDate = DateFormatter.format(
      this._orderForm.get('dueDate').value
    );
    transaction.productTransactions = this._productTransactions;

    this._isLoading = true;
    this.loaderLayoutComponent.label = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_CONFIRMED_ORDER_DIALOG.LOADING_MESSAGE');
    this.transactionService
      .registerTransaction(transaction)
      .subscribe({
        next: (result: ITransactionPayload) => {
          this._isLoading = false;
          this.notificationService.openSuccessNotification(this.translateService.instant(
            'PRODUCT_CART_PAGE.SAVE_NEW_CONFIRMED_ORDER_DIALOG.SUCCESS_MESSAGE'
          ));
          this.store.dispatch(
            ProductTransactionActions.setSaveOrderLoadingState({
              state: false,
            })
          );
          this.storageService.remove('productTransactions');
          this.store.dispatch(
            ProductTransactionActions.resetProductTransactionState()
          );

          this.sendOrderReceiptEmailNotification(result.id);

          if (this._transactionId === 0) {
            this.router.navigate(['/product-catalogue']);
          } else {
            this.router.navigate(['/draft-transactions']);
          }
        },

        error: () => {
          this._isLoading = false;
          this.notificationService.openErrorNotification(this.translateService.instant(
            'PRODUCT_CART_PAGE.SAVE_NEW_CONFIRMED_ORDER_DIALOG.ERROR_MESSAGE'
          ));

          this.store.dispatch(
            ProductTransactionActions.setSaveOrderLoadingState({
              state: false,
            })
          );
        },
      });
  }


  private sendOrderReceiptEmailNotification(transactionId: number) {
    this.transactionService
      .sendOrderReceiptEmailNotification(transactionId).subscribe();
  }

  get orderForm(): FormGroup {
    return this._orderForm;
  }

  get discountForm(): FormGroup {
    return this._discountForm;
  }

  get productCartTransactions(): Array<ProductCartTransaction> {
    return this._productCartTransactions;
  }

  get productTransactions(): Array<ProductTransaction> {
    return this._productTransactions;
  }

  get grossTotalAmount(): string {
    return NumberFormatter.formatCurrency(this._totalAmount);
  }

  get netTotalAmount(): string {
    const discount = this._discountForm.get('discount').value;
    const calculatedNetTotalAmount =
      this._totalAmount - (discount / 100) * this._totalAmount;
    return NumberFormatter.formatCurrency(calculatedNetTotalAmount);
  }

  get minDate(): Date {
    return this._orderForm.get('transactionDate').value;
  }

  get isDraftTransaction(): boolean {
    return this._transactionId > 0;
  }

  get barangayOptions(): Array<Barangay> {
    return this._barangayOptions;
  }

  get paymentMethodOptions(): Array<PaymentMethod> {
    return this._paymentMethodOptions;
  }

  get customerStoreOptions(): Array<CustomerStore> {
    const currentBarangay = this._orderForm.get('barangay').value.toLowerCase();
    return this._customerStoreOptions.filter((option) => {
      return (
        option.barangay?.name.toLowerCase().includes(currentBarangay)
      );
    });
  }
}
