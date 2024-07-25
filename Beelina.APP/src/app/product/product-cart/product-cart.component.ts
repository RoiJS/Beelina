import { ActivatedRoute, Router } from '@angular/router';
import { Component, computed, inject, OnDestroy, OnInit, signal, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { barangaysSelector } from 'src/app/barangays/store/selectors';
import { customerStoresSelector } from 'src/app/customer/store/selectors';
import {
  productTransactionsSelector,
  transactionsSelector,
} from '../add-to-cart-product/store/selectors';
import { paymentMethodsSelector } from 'src/app/payment-methods/store/selectors';


import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { AuthService } from 'src/app/_services/auth.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { ProductService } from 'src/app/_services/product.service';
import { StorageService } from 'src/app/_services/storage.service';

import { AddToCartProductComponent } from '../add-to-cart-product/add-to-cart-product.component';
import { AgreementConfirmationComponent } from './agreement-confirmation/agreement-confirmation.component';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { LoaderLayoutComponent } from 'src/app/shared/ui/loader-layout/loader-layout.component';
import { SelectNewProductComponent } from './select-new-product/select-new-product.component';

import {
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
import { ModuleEnum } from 'src/app/_enum/module.enum';
import { PermissionLevelEnum } from 'src/app/_enum/permission-level.enum';
import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';

import { Barangay } from 'src/app/_models/barangay';
import { InsufficientProductQuantity } from 'src/app/_models/insufficient-product-quantity';
import { ProductTransaction, Transaction } from 'src/app/_models/transaction';
import { PaymentMethod } from 'src/app/_models/payment-method';

@Component({
  selector: 'app-product-cart',
  templateUrl: './product-cart.component.html',
  styleUrls: ['./product-cart.component.scss'],
})
export class ProductCartComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  loaderLayoutComponent = viewChild(LoaderLayoutComponent);

  private _orderForm: FormGroup;
  private _discountForm: FormGroup;

  private _customerStoreOptions = signal<Array<CustomerStore>>([]);
  private _subscription: Subscription = new Subscription();
  private _selectedCustomer = signal<CustomerStore>(new CustomerStore());
  private _selectedBarangay = signal<Barangay>(new Barangay());
  private _totalAmount = signal<number>(0);
  private _transactionId = signal<number>(0);

  private _saveDraftTitle = signal<string>('');
  private _saveDraftConfirmMessage = signal<string>('');
  private _saveDraftLoadingMessage = signal<string>('');
  private _saveDraftSuccessMessage = signal<string>('');
  private _saveDraftErrorMessage = signal<string>('');
  private _dialogRef: MatBottomSheetRef<AgreementConfirmationComponent>;

  barangayOptions = signal<Array<Barangay>>([]);
  dateUpdated = signal<string>('');
  updatedBy = signal<string>('');
  paymentMethodOptions = signal<Array<PaymentMethod>>([]);
  productTransactions = signal<Array<ProductTransaction>>([]);
  transaction = signal<Transaction>(new Transaction());
  originalTransaction = signal<Transaction>(new Transaction());
  originalProductTransactions = signal<Array<ProductTransaction>>([]);

  activatedRoute = inject(ActivatedRoute);
  authService = inject(AuthService);
  bottomSheet = inject(MatBottomSheet);
  dialogService = inject(DialogService);
  formBuilder = inject(FormBuilder);
  notificationService = inject(NotificationService);
  productService = inject(ProductService);
  router = inject(Router);
  store = inject(Store<AppStateInterface>);
  storageService = inject(StorageService);
  transactionService = inject(TransactionService);
  translateService = inject(TranslateService);

  isAdmin = signal<boolean>(false);

  grossTotalAmount = computed(() => {
    return NumberFormatter.formatCurrency(this._totalAmount());
  })

  isDraftTransaction = computed(() => {
    return this._transactionId() > 0 && this.transaction().status === TransactionStatusEnum.DRAFT;
  });

  constructor() {
    super();

    const routerData = <{ dateUpdated: string; updatedBy: string }>this.router.getCurrentNavigation()?.extras?.state;
    this.dateUpdated.set(routerData?.dateUpdated);
    this.updatedBy.set(routerData?.updatedBy);

    this._currentLoggedInUser = this.authService.user.value;
    this.isAdmin.set(this.modulePrivilege(ModuleEnum.Distribution) === this.getPermissionLevel(PermissionLevelEnum.Administrator));

    this._orderForm = this.formBuilder.group({
      invoiceNo: ['', Validators.required],
      barangay: ['', Validators.required],
      name: ['', Validators.required],
      address: [''],
      paymentMethod: [0, Validators.required],
      transactionDate: [new Date(), Validators.required],
      dueDate: [new Date(), Validators.required],
      paid: [false]
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

    this._transactionId.set(+this.activatedRoute.snapshot.paramMap.get('id'));

    if (this._transactionId() > 0) {
      this._isLoading = true;
      this.store.dispatch(
        ProductTransactionActions.getProductTransactionsFromServer({
          transactionId: this._transactionId(),
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
          this._customerStoreOptions.set(customerStores);
        })
    );

    this._subscription.add(
      this.store
        .pipe(select(barangaysSelector))
        .subscribe((barangays: Array<Barangay>) => {
          this.barangayOptions.set(barangays);
        })
    );

    this._subscription.add(this.store
      .pipe(select(paymentMethodsSelector))
      .subscribe((paymentMethods: Array<PaymentMethod>) => {
        this.paymentMethodOptions.set(paymentMethods);
      }));

    this._subscription.add(
      this.store
        .pipe(select(productTransactionsSelector))
        .subscribe((productTransactions: Array<ProductTransaction>) => {
          this.productTransactions.set(productTransactions);

          if (this.originalProductTransactions().length === 0) {
            this.originalProductTransactions.set(productTransactions);
          }

          if (this._transactionId() === 0) {
            this.storageService.storeString(
              'productTransactions',
              JSON.stringify(this.productTransactions())
            );
          }

          if (
            this.productTransactions().length === 0 &&
            this._transactionId() === 0
          ) {
            this.router.navigate(['/product-catalogue/product-list']);
          }

          this._totalAmount.set(this.productTransactions().reduce(
            (t, n) => t + n.price * n.quantity,
            0
          ));
        })
    );

    this._subscription.add(
      this.store
        .pipe(select(transactionsSelector))
        .subscribe((transaction: Transaction) => {
          this.transaction.set(transaction);
          this.originalTransaction.set(transaction);

          if (this.transaction().store) {
            this._orderForm
              .get('invoiceNo')
              .setValue(this.transaction().invoiceNo);
            this._discountForm
              .get('discount')
              .setValue(this.transaction().discount || 0);
            this._orderForm
              .get('barangay')
              .setValue(this.transaction().store.barangay.name);
            this._orderForm.get('name').setValue(this.transaction().store.name);
            this._selectedCustomer.set(this.transaction().store);
            this._orderForm
              .get('address')
              .setValue(this.transaction().store.address);
            this._orderForm
              .get('paymentMethod')
              .setValue(this.transaction().modeOfPayment);
            this._orderForm
              .get('transactionDate')
              .setValue(this.transaction().transactionDate || new Date());
            this._orderForm
              .get('dueDate')
              .setValue(this.transaction().dueDate || new Date());
            this._orderForm
              .get('paid')
              .setValue(!this.transaction().hasUnpaidProductTransaction);
          }
        })
    );

    this._subscription.add(
      barangayControl.valueChanges.subscribe((value) => {
        nameControl.setValue('');

        this._selectedBarangay.set(this.barangayOptions().find(
          (c) => c.name === value
        ));

        if (this._selectedBarangay) {
          nameControl.enable();
        } else {
          nameControl.disable();
        }
      })
    );

    this._subscription.add(
      nameControl.valueChanges.subscribe((value) => {
        this._selectedCustomer.set(this._customerStoreOptions().find(
          (c) => c.name === value
        ));

        addressControl.setValue('');
        paymentMethodControl.setValue(0);

        if (this._selectedCustomer) {
          this._orderForm
            .get('address')
            .setValue(this._selectedCustomer()?.address);
          this._orderForm
            .get('paymentMethod')
            .setValue(this._selectedCustomer()?.paymentMethod.id);
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
    this._saveDraftTitle.set(this.translateService.instant('PRODUCT_CART_PAGE.SAVE_EXISTING_DRAFT_ORDER_DIALOG.TITLE'));
    this._saveDraftConfirmMessage.set(this.translateService.instant('PRODUCT_CART_PAGE.SAVE_EXISTING_DRAFT_ORDER_DIALOG.CONFIRM'));
    this._saveDraftLoadingMessage.set(this.translateService.instant('PRODUCT_CART_PAGE.SAVE_EXISTING_DRAFT_ORDER_DIALOG.LOADING_MESSAGE'));
    this._saveDraftSuccessMessage.set(this.translateService.instant('PRODUCT_CART_PAGE.SAVE_EXISTING_DRAFT_ORDER_DIALOG.SUCCESS_MESSAGE'));
    this._saveDraftErrorMessage.set(this.translateService.instant('PRODUCT_CART_PAGE.SAVE_EXISTING_DRAFT_ORDER_DIALOG.ERROR_MESSAGE'));
    this.saveAsDraft();
  }

  saveNewOrderAsDraft() {
    this._saveDraftTitle.set(this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_DRAFT_ORDER_DIALOG.TITLE'));
    this._saveDraftConfirmMessage.set(this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_DRAFT_ORDER_DIALOG.CONFIRM'));
    this._saveDraftLoadingMessage.set(this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_DRAFT_ORDER_DIALOG.LOADING_MESSAGE'));
    this._saveDraftSuccessMessage.set(this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_DRAFT_ORDER_DIALOG.SUCCESS_MESSAGE'));
    this._saveDraftErrorMessage.set(this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_DRAFT_ORDER_DIALOG.ERROR_MESSAGE'));
    this.saveAsDraft();
  }

  saveAsDraft() {
    this._orderForm.markAllAsTouched();
    if (this._orderForm.valid) {
      const transaction = new TransactionDto();
      transaction.id = this._transactionId();
      transaction.storeId = this._selectedCustomer().id;
      transaction.status = TransactionStatusEnum.DRAFT;
      transaction.modeOfPayment = this._orderForm.get('paymentMethod').value;
      transaction.paid = this._orderForm.get('paid').value;
      transaction.invoiceNo = this._orderForm.get('invoiceNo').value;
      transaction.discount = this._discountForm.get('discount').value;
      transaction.transactionDate = DateFormatter.format(
        this._orderForm.get('transactionDate').value
      );
      transaction.dueDate = DateFormatter.format(
        this._orderForm.get('dueDate').value
      );
      transaction.productTransactions = this.productTransactions();

      this.dialogService
        .openConfirmation(
          this._saveDraftTitle(),
          this._saveDraftConfirmMessage()
        )
        .subscribe((result: ButtonOptions) => {
          if (result === ButtonOptions.YES) {
            this._isLoading = true;
            this.loaderLayoutComponent().label = this._saveDraftLoadingMessage();
            this._subscription.add(this.transactionService
              .registerTransaction(transaction)
              .subscribe({
                next: () => {
                  this._isLoading = false;
                  this.notificationService.openSuccessNotification(this._saveDraftSuccessMessage());
                  this.store.dispatch(
                    ProductTransactionActions.setSaveOrderLoadingState({
                      state: false,
                    })
                  );
                  this.storageService.remove('productTransactions');
                  this.store.dispatch(
                    ProductTransactionActions.resetProductTransactionState()
                  );

                  if (this._transactionId() === 0) {
                    this.router.navigate(['/product-catalogue']);
                  } else {
                    this.router.navigate(['/draft-transactions']);
                  }
                },

                error: () => {
                  this._isLoading = false;
                  this.notificationService.openErrorNotification(this._saveDraftErrorMessage());

                  this.store.dispatch(
                    ProductTransactionActions.setSaveOrderLoadingState({
                      state: false,
                    })
                  );
                },
              }));
          }
        });
    }
  }

  saveAsBadOrder() {
    this._orderForm.markAllAsTouched();
    if (this._orderForm.valid) {
      const transaction = new TransactionDto();
      transaction.id = this._transactionId();
      transaction.storeId = this._selectedCustomer().id;
      transaction.status = TransactionStatusEnum.BAD_ORDER;
      transaction.modeOfPayment = this._orderForm.get('paymentMethod').value;
      transaction.paid = this._orderForm.get('paid').value;
      transaction.invoiceNo = this._orderForm.get('invoiceNo').value;
      transaction.discount = this._discountForm.get('discount').value;
      transaction.transactionDate = DateFormatter.format(
        this._orderForm.get('transactionDate').value
      );
      transaction.dueDate = DateFormatter.format(
        this._orderForm.get('dueDate').value
      );
      transaction.productTransactions = this.productTransactions();

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
            this.loaderLayoutComponent().label = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_BAD_ORDER_DIALOG.LOADING_MESSAGE');
            this._subscription.add(this.transactionService.registerTransaction(transaction).subscribe({
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

                if (this._transactionId() === 0) {
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
            }));
          }
        });
    }
  }

  markTransactionAsPaid(paid: boolean) {
    const title = this.translateService.instant(paid ? 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.TITLE' : 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_UNPAID_DIALOG.TITLE');
    const confirmationMessage = this.translateService.instant(paid ? 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.CONFIRM' : 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_UNPAID_DIALOG.CONFIRM');
    const successMessage = this.translateService.instant(paid ? 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.SUCCESS_MESSAGE' : 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_UNPAID_DIALOG.SUCCESS_MESSAGE');
    const errorMessage = this.translateService.instant(paid ? 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.ERROR_MESSAGE' : 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_UNPAID_DIALOG.ERROR_MESSAGE');
    const loadingMessage = this.translateService.instant(paid ? 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.LOADING_MESSAGE' : 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_UNPAID_DIALOG.LOADING_MESSAGE');

    this.dialogService
      .openConfirmation(title, confirmationMessage)
      .subscribe((result: ButtonOptions) => {
        if (result == ButtonOptions.YES) {
          this._isLoading = true;
          this.loaderLayoutComponent().label = loadingMessage;
          this.transactionService
            .markTransactionsAsPaid([this._transactionId()], paid)
            .subscribe({
              next: () => {
                this._isLoading = false;
                this.notificationService.openSuccessNotification(successMessage);
                this.router.navigate(['/order-transactions']);
              },

              error: () => {
                this._isLoading = false;
                this.notificationService.openErrorNotification(errorMessage);
              },
            });
        }
      });
  }

  updateItemToCart(productId: number) {
    this.bottomSheet.open(AddToCartProductComponent, {
      data: { productId, productTransactions: this.productTransactions() },
    });
  }

  confirm() {
    this._orderForm.markAllAsTouched();
    if (!this._orderForm.valid) return;

    this._isLoading = true;
    this.loaderLayoutComponent().label = this.translateService.instant('PRODUCT_CART_PAGE.INSUFFICIENT_PRODUCT_QUANTITY_DIALOG.LOADING_MESSAGE');
    this.productService
      .validateProductionTransactionsQuantities(this.productTransactions())
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
                paid: boolean;
              }) => {
                if (!data) return;

                if (data.confirm) {
                  this._orderForm.get('paid').setValue(data.paid);
                  this.proceedConfirm();
                }
              }
            );
        }
      );
  }

  saveNewUpdate() {
    this._orderForm.markAllAsTouched();
    if (this._orderForm.valid) {

      if (!this.transactionHasChanged()) return;

      const transaction = new TransactionDto();
      transaction.id = this._transactionId();
      transaction.storeId = this._selectedCustomer().id;
      transaction.status = this.transaction().status;
      transaction.modeOfPayment = this._orderForm.get('paymentMethod').value;
      transaction.paid = this._orderForm.get('paid').value;
      transaction.invoiceNo = this._orderForm.get('invoiceNo').value;
      transaction.discount = this._discountForm.get('discount').value;
      transaction.transactionDate = DateFormatter.format(
        this._orderForm.get('transactionDate').value
      );
      transaction.dueDate = DateFormatter.format(
        this._orderForm.get('dueDate').value
      );
      transaction.productTransactions = this.productTransactions();

      this.dialogService
        .openConfirmation(
          this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_UPDATE_DIALOG.TITLE'),
          this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_UPDATE_DIALOG.CONFIRM'),
        )
        .subscribe((result: ButtonOptions) => {
          if (result === ButtonOptions.YES) {
            this._isLoading = true;
            this.loaderLayoutComponent().label = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_UPDATE_DIALOG.LOADING_MESSAGE');
            this._subscription.add(this.transactionService
              .registerTransaction(transaction)
              .subscribe({
                next: () => {
                  this._isLoading = false;
                  this.notificationService.openSuccessNotification(this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_UPDATE_DIALOG.SUCCESS_MESSAGE'));
                  this.store.dispatch(
                    ProductTransactionActions.setSaveOrderLoadingState({
                      state: false,
                    })
                  );
                  this.storageService.remove('productTransactions');
                  this.store.dispatch(
                    ProductTransactionActions.resetProductTransactionState()
                  );

                  this.router.navigate(['/order-transactions']);
                },

                error: () => {
                  this._isLoading = false;
                  this.notificationService.openErrorNotification(this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_UPDATE_DIALOG.ERROR_MESSAGE'));

                  this.store.dispatch(
                    ProductTransactionActions.setSaveOrderLoadingState({
                      state: false,
                    })
                  );
                },
              }));
          }
        });
    }
  }

  registerPayment() {
    const transactionDate = DateFormatter.format(this.transaction().transactionDate);
    this.router.navigate([`transaction-history/transactions/${transactionDate}/${this._transactionId()}/payments`], {
      state: {
        openRegisterDialog: true
      }
    });
  }

  goToPaymentHistory() {
    const transactionDate = DateFormatter.format(this.transaction().transactionDate);
    this.router.navigate([`transaction-history/transactions/${transactionDate}/${this._transactionId()}/payments`], {
      state: {
        openRegisterDialog: false
      }
    });
  }

  addINewtemToCart() {
    this.bottomSheet.open(SelectNewProductComponent, {
      data: { productTransactions: this.productTransactions() },
    });
  }

  transactionHasChanged() {
    const transaction = new TransactionDto();
    transaction.id = this._transactionId();
    transaction.storeId = this._selectedCustomer().id;
    transaction.status = this.transaction().status;
    transaction.modeOfPayment = this._orderForm.get('paymentMethod').value;
    transaction.paid = this._orderForm.get('paid').value;
    transaction.invoiceNo = this._orderForm.get('invoiceNo').value;
    transaction.discount = this._discountForm.get('discount').value;
    transaction.transactionDate = DateFormatter.format(
      this._orderForm.get('transactionDate').value
    );
    transaction.dueDate = DateFormatter.format(
      this._orderForm.get('dueDate').value
    );
    transaction.productTransactions = this.productTransactions();

    let detailsHasChanged = false;
    let orderItemsHasChanged = false;

    const originalTransaction = this.originalTransaction();
    const originalProductTransactions = this.originalProductTransactions();

    if (originalTransaction.storeId !== transaction.storeId ||
      originalTransaction.modeOfPayment !== transaction.modeOfPayment ||
      originalTransaction.invoiceNo !== transaction.invoiceNo ||
      originalTransaction.discount !== transaction.discount ||
      DateFormatter.format(originalTransaction.transactionDate) !== transaction.transactionDate.toString() ||
      DateFormatter.format(originalTransaction.dueDate) !== transaction.dueDate.toString()
    ) {
      detailsHasChanged = true;
    }


    if (JSON.stringify(originalProductTransactions.map((p) => { return { productId: p.productId, quantity: p.quantity } })) !==
      JSON.stringify(transaction.productTransactions.map((p) => { return { productId: p.productId, quantity: p.quantity } }))) {
      orderItemsHasChanged = true;
    }

    return detailsHasChanged || orderItemsHasChanged;
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
    transaction.id = this._transactionId();
    transaction.invoiceNo = this._orderForm.get('invoiceNo').value;
    transaction.discount = this._discountForm.get('discount').value;
    transaction.storeId = this._selectedCustomer().id;
    transaction.status = TransactionStatusEnum.CONFIRMED;
    transaction.modeOfPayment = this._orderForm.get('paymentMethod').value;
    transaction.paid = this._orderForm.get('paid').value;
    transaction.transactionDate = DateFormatter.format(
      this._orderForm.get('transactionDate').value
    );
    transaction.dueDate = DateFormatter.format(
      this._orderForm.get('dueDate').value
    );
    transaction.productTransactions = this.productTransactions();

    this._isLoading = true;
    this.loaderLayoutComponent().label = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_CONFIRMED_ORDER_DIALOG.LOADING_MESSAGE');
    this._subscription.add(this.transactionService
      .registerTransaction(transaction)
      .subscribe({
        next: (id: number) => {
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

          this.sendOrderReceiptEmailNotification(id);

          if (this._transactionId() === 0) {
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
      }));
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

  get netTotalAmount(): string {
    const discount = this._discountForm.get('discount').value;
    const calculatedNetTotalAmount =
      this._totalAmount() - (discount / 100) * this._totalAmount();
    return NumberFormatter.formatCurrency(calculatedNetTotalAmount);
  }

  get minDate(): Date {
    return this._orderForm.get('transactionDate').value;
  }

  get customerStoreOptions(): Array<CustomerStore> {
    const currentBarangay = this._orderForm.get('barangay').value.toLowerCase();
    return this._customerStoreOptions().filter((option) => {
      return (
        option.barangay?.name.toLowerCase().includes(currentBarangay)
      );
    });
  };
}
