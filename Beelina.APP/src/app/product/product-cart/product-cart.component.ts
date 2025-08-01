import { ActivatedRoute, Router } from '@angular/router';
import { Component, computed, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { select, Store } from '@ngrx/store';
import { firstValueFrom, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { barangaysSelector } from 'src/app/barangays/store/selectors';
import { customerStoresSelector } from 'src/app/customer/store/selectors';
import {
  isLoadingSelector,
  productTransactionsSelector,
  transactionsSelector,
} from '../add-to-cart-product/store/selectors';
import { paymentMethodsSelector } from 'src/app/payment-methods/store/selectors';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { ApplySubscriptionService } from 'src/app/_services/apply-subscription.service';
import { AuthService } from 'src/app/_services/auth.service';
import { BluetoothPrintInvoiceService } from 'src/app/_services/bluetooth-print-invoice.service';
import { ClientSubscriptionDetails } from 'src/app/_models/client-subscription-details.model';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { InvoicePrintService } from 'src/app/_services/print/invoice-print.service';
import { LocalClientSubscriptionDbService } from 'src/app/_services/local-db/local-client-subscription-db.service';
import { LocalOrdersDbService } from 'src/app/_services/local-db/local-orders-db.service';
import { LogMessageService } from 'src/app/_services/log-message.service';
import { NetworkService } from 'src/app/_services/network.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { ProductService } from 'src/app/_services/product.service';
import { StorageService } from 'src/app/_services/storage.service';
import { UserAccountService } from 'src/app/_services/user-account.service';

import { AddToCartProductComponent } from '../add-to-cart-product/add-to-cart-product.component';
import { AgreementConfirmationComponent } from './agreement-confirmation/agreement-confirmation.component';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { LoaderLayoutComponent } from 'src/app/shared/ui/loader-layout/loader-layout.component';
import { PrintOptionDialogComponent } from './print-option-dialog/print-option-dialog.component';
import { SelectNewProductComponent } from './select-new-product/select-new-product.component';

import {
  TransactionDto,
  TransactionService
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
import { LogLevelEnum } from 'src/app/_enum/log-type.enum';
import { ModuleEnum } from 'src/app/_enum/module.enum';
import { PermissionLevelEnum } from 'src/app/_enum/permission-level.enum';
import { PrintForSettingsEnum } from 'src/app/_enum/print-for-settings.enum';
import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';

import { Barangay } from 'src/app/_models/barangay';
import { InvalidProductTransactionOverallQuantitiesTransactions } from 'src/app/_models/insufficient-product-quantity';
import { ProductTransaction, Transaction } from 'src/app/_models/transaction';
import { PaymentMethod } from 'src/app/_models/payment-method';
import { LocalUserSettingsDbService } from 'src/app/_services/local-db/local-user-settings-db.service';
import { UserSetting } from 'src/app/_models/user-setting';


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
  private _printReceiptNow = signal<boolean>(false);

  private _saveDraftTitle = signal<string>('');
  private _saveDraftConfirmMessage = signal<string>('');
  private _saveDraftLoadingMessage = signal<string>('');
  private _saveDraftSuccessMessage = signal<string>('');
  private _saveDraftErrorMessage = signal<string>('');
  private _dialogRef: MatBottomSheetRef<AgreementConfirmationComponent>;
  private _dialogPrintOptionRef: MatBottomSheetRef<PrintOptionDialogComponent>;

  private FORM_STORAGE_KEY = 'productCartForm';

  barangayOptions = signal<Array<Barangay>>([]);
  dateUpdated = signal<string>('');
  updatedBy = signal<string>('');
  isLocalTransaction = signal<boolean>(false);
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
  invoicePrintService = inject(InvoicePrintService);
  clientSubscriptionDetails: ClientSubscriptionDetails;
  userSettings: UserSetting;

  applySubscriptionService = inject(ApplySubscriptionService);
  bluetoothPrintInvoiceService = inject(BluetoothPrintInvoiceService);
  localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService);
  localUserSettingsDbService = inject(LocalUserSettingsDbService);
  localOrdersDbService = inject(LocalOrdersDbService);
  loggerService = inject(LogMessageService);
  notificationService = inject(NotificationService);
  networkService = inject(NetworkService);
  productService = inject(ProductService);
  router = inject(Router);
  store = inject(Store<AppStateInterface>);
  storageService = inject(StorageService);
  transactionService = inject(TransactionService);
  translateService = inject(TranslateService);
  userService = inject(UserAccountService);

  isAdmin = signal<boolean>(false);

  grossTotalAmount = computed(() => {
    return NumberFormatter.formatCurrency(this._totalAmount());
  })

  isDraftTransaction = computed(() => {
    return this._transactionId() > 0 && this.transaction().status === TransactionStatusEnum.DRAFT;
  });

  isForLocalTransaction = computed(() => {
    return (!navigator.onLine) || (this._transactionId() > 0 && this.isLocalTransaction());
  });

  autoPrintReceipt = computed(() => {
    return this.userSettings.allowPrintReceipt && this.userSettings.autoPrintReceipt;
  });

  constructor() {
    super();

    const routerData = <{ dateUpdated: string; updatedBy: string; isLocalTransaction: boolean }>this.router.getCurrentNavigation()?.extras?.state;
    this.dateUpdated.set(routerData?.dateUpdated);
    this.updatedBy.set(routerData?.updatedBy);
    this.isLocalTransaction.set(routerData?.isLocalTransaction);

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

    this.$isLoading = this.store.pipe(select(isLoadingSelector));
    this.applySubscriptionService.setBottomSheet(this.bottomSheet);
  }

  async ngOnInit() {
    const barangayControl = this._orderForm.get('barangay');
    const nameControl = this._orderForm.get('name');
    const addressControl = this._orderForm.get('address');
    const paymentMethodControl = this._orderForm.get('paymentMethod');

    nameControl.disable();
    addressControl.disable();

    this._transactionId.set(+this.activatedRoute.snapshot.paramMap.get('id'));
    this.clientSubscriptionDetails = await this.localClientSubscriptionDbService.getLocalClientSubsription();
    this.userSettings = await this.localUserSettingsDbService.getLocalUserSettings();

    // Get transaction details
    this.store.dispatch(
      ProductTransactionActions.getProductTransactions({
        transactionId: this._transactionId(),
        isLocalTransaction: this.isLocalTransaction() || !this.networkService.isOnline.value,
      })
    );

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
        .subscribe(async (transaction: Transaction) => {
          this.transaction.set(transaction);
          this.originalTransaction.set(transaction);

          // Print receipt via printer
          if (this._printReceiptNow()) {
            this.store.dispatch(
              ProductTransactionActions.setSaveOrderLoadingState({
                state: true,
              })
            );

            await this.printReceipt();

            this.store.dispatch(
              ProductTransactionActions.setSaveOrderLoadingState({
                state: false,
              })
            );
          }

          if (this.transaction().store) {
            this._orderForm
              .get('invoiceNo')
              .setValue(this.transaction().invoiceNo);

            // If the transaction is new, get the latest transaction code and increment it
            if (this._transactionId() === 0) {
              let latestTransactionCode = '';

              if (this.networkService.isOnline.value) {
                latestTransactionCode = await firstValueFrom(this.productService.getLatestTransactionCode());
              } else {
                latestTransactionCode = await this.localOrdersDbService.getLatestLocalTransactionNumber();
              }

              if (latestTransactionCode) {
                const nextCode = this.incrementCode(latestTransactionCode);
                this._orderForm.get('invoiceNo').setValue(nextCode);
              }
            }

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

        if (this._selectedBarangay()) {
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

        if (this._selectedCustomer()) {
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

    this._subscription.add(
      this._orderForm.valueChanges.subscribe(() => {
        if (this._transactionId() === 0) {
          this.saveFormStateToStorage();
        }
      })
    );

    this._subscription.add(
      this._discountForm.valueChanges.subscribe(() => {
        if (this._transactionId() === 0) {
          this.saveFormStateToStorage();
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
          this.clearFormStateFromStorage();
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

    try {
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
          .subscribe(async (result: ButtonOptions) => {
            if (result === ButtonOptions.YES) {
              this.store.dispatch(
                ProductTransactionActions.setSaveOrderLoadingState({
                  state: true,
                })
              );
              this.loaderLayoutComponent().label = this._saveDraftLoadingMessage();

              if (this.isForLocalTransaction()) {
                await this.saveLocalDraftOrder(transaction);
              } else {
                this.saveDraftOrderToServer(transaction);
              }
            }
          });
      }
    } catch (ex) {
      console.error(ex);
      this.loggerService.logMessage(LogLevelEnum.ERROR, ex);
    }
  }

  async syncLocalDraftOrder() {

    try {

      this.dialogService
        .openConfirmation(
          this.translateService.instant("DRAFT_TRANSACTIONS_PAGE.SYNC_OFFLINE_ORDER_DIALOG.TITLE"),
          this.translateService.instant("DRAFT_TRANSACTIONS_PAGE.SYNC_OFFLINE_ORDER_DIALOG.CONFIRM_MESSAGE"),
        )
        .subscribe(async (result: ButtonOptions) => {
          if (result === ButtonOptions.YES) {
            this.store.dispatch(
              ProductTransactionActions.setSaveOrderLoadingState({
                state: true,
              })
            );
            this.loaderLayoutComponent().label = this._saveDraftLoadingMessage();

            // Make sure to save changes first before syncing.
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

            await this.localOrdersDbService.saveLocalOrder(TransactionStatusEnum.DRAFT, transaction);
            await this.localOrdersDbService.saveLocalOrdersToServer(TransactionStatusEnum.DRAFT, [this._transactionId()]);

            this.notificationService.openSuccessNotification(this.translateService.instant(
              "DRAFT_TRANSACTIONS_PAGE.SYNC_OFFLINE_ORDER_DIALOG.SUCCESS_MESSAGE"
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
          }
        });
    } catch (ex) {
      console.error(ex);
      this.loggerService.logMessage(LogLevelEnum.ERROR, ex);
    }
  }

  saveAsBadOrder() {

    try {
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
          .subscribe(async (result: ButtonOptions) => {
            if (result === ButtonOptions.YES) {
              this.store.dispatch(
                ProductTransactionActions.setSaveOrderLoadingState({
                  state: true,
                })
              );
              this.loaderLayoutComponent().label = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_BAD_ORDER_DIALOG.LOADING_MESSAGE');

              if (this.isForLocalTransaction()) {
                await this.saveLocalBadOrder(transaction);
              } else {
                this.saveBadOrderToServer(transaction);
              }
            }
          });
      }
    } catch (ex) {
      console.error(ex);
      this.loggerService.logMessage(LogLevelEnum.ERROR, ex);
    }
  }

  markTransactionAsPaid(paid: boolean) {
    const title = this.translateService.instant(paid ? 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.TITLE' : 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_UNPAID_DIALOG.TITLE');
    const confirmationMessage = this.translateService.instant(paid ? 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.CONFIRM' : 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_UNPAID_DIALOG.CONFIRM');
    const successMessage = this.translateService.instant(paid ? 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.SUCCESS_MESSAGE' : 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_UNPAID_DIALOG.SUCCESS_MESSAGE');
    const errorMessage = this.translateService.instant(paid ? 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.ERROR_MESSAGE' : 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_UNPAID_DIALOG.ERROR_MESSAGE');
    const loadingMessage = this.translateService.instant(paid ? 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.LOADING_MESSAGE' : 'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_UNPAID_DIALOG.LOADING_MESSAGE');

    try {
      this.dialogService
        .openConfirmation(title, confirmationMessage)
        .subscribe((result: ButtonOptions) => {
          if (result == ButtonOptions.YES) {
            this.store.dispatch(
              ProductTransactionActions.setSaveOrderLoadingState({
                state: true,
              })
            );
            this.loaderLayoutComponent().label = loadingMessage;
            this.transactionService
              .markTransactionsAsPaid([this._transactionId()], paid)
              .subscribe({
                next: () => {
                  this.store.dispatch(
                    ProductTransactionActions.setSaveOrderLoadingState({
                      state: false,
                    })
                  );
                  this.notificationService.openSuccessNotification(successMessage);
                  this.router.navigate(['/order-transactions']);
                },

                error: () => {
                  this.store.dispatch(
                    ProductTransactionActions.setSaveOrderLoadingState({
                      state: false,
                    })
                  );
                  this.notificationService.openErrorNotification(errorMessage);
                },
              });
          }
        });
    } catch (ex) {
      console.error(ex);
      this.loggerService.logMessage(LogLevelEnum.ERROR, ex);
    }

  }

  updateItemToCart(productId: number) {
    this.bottomSheet.open(AddToCartProductComponent, {
      data: { productId, productTransactions: this.productTransactions() },
    });
  }

  confirm() {

    try {
      this._orderForm.markAllAsTouched();
      if (!this._orderForm.valid) return;

      const transaction = new TransactionDto();
      transaction.id = this._transactionId();
      transaction.storeId = this._selectedCustomer().id;
      transaction.status = TransactionStatusEnum.CONFIRMED;
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

      this.store.dispatch(
        ProductTransactionActions.setSaveOrderLoadingState({
          state: true,
        })
      );
      this.loaderLayoutComponent().label = this.translateService.instant('PRODUCT_CART_PAGE.INSUFFICIENT_PRODUCT_QUANTITY_DIALOG.LOADING_MESSAGE');
      this.productService
        .validateProductionTransactionsQuantities([transaction])
        .subscribe(
          (productsWithInsufficientQuantities: Array<InvalidProductTransactionOverallQuantitiesTransactions>) => {
            // console.log(productsWithInsufficientQuantities);

            this.store.dispatch(
              ProductTransactionActions.setSaveOrderLoadingState({
                state: false,
              })
            );
            if (productsWithInsufficientQuantities.length > 0) {
              let errorMessage = this.translateService.instant(
                'PRODUCT_CART_PAGE.INSUFFICIENT_PRODUCT_QUANTITY_DIALOG.MESSAGE'
              );

              const products = productsWithInsufficientQuantities[0].invalidProductTransactionOverallQuantities;

              products.forEach((i) => {
                errorMessage += `<strong>(${i.productCode})</strong> ${i.productName} <br>`;
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
    } catch (ex) {
      console.error(ex);
      this.loggerService.logMessage(LogLevelEnum.ERROR, ex);
    }

  }

  saveNewUpdate() {

    try {
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
              this.store.dispatch(
                ProductTransactionActions.setSaveOrderLoadingState({
                  state: true,
                })
              );
              this.loaderLayoutComponent().label = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_UPDATE_DIALOG.LOADING_MESSAGE');
              this._subscription.add(this.transactionService
                .registerTransaction(transaction)
                .subscribe({

                  next: () => {
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
    } catch (ex) {
      console.error(ex);
      this.loggerService.logMessage(LogLevelEnum.ERROR, ex);
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

  printReceiptAsPDF() {

    if (!this.clientSubscriptionDetails.orderPrintActive) {
      this.applySubscriptionService.open(this.translateService.instant("SUBSCRIPTION_TEXTS.PRINTING_INVOICE_ERROR"));
      return;
    }

    try {
      this._dialogPrintOptionRef = this.bottomSheet.open(PrintOptionDialogComponent);

      this._dialogPrintOptionRef
        .afterDismissed()
        .subscribe(
          async (data: {
            printForSettingsEnum: PrintForSettingsEnum;
          }) => {
            if (!data) return;
            this.store.dispatch(
              ProductTransactionActions.setSaveOrderLoadingState({
                state: true,
              })
            );
            await this.invoicePrintService.printInvoice(this._transactionId(), data.printForSettingsEnum);
            this.store.dispatch(
              ProductTransactionActions.setSaveOrderLoadingState({
                state: false,
              })
            );
          }
        );
    } catch (ex) {
      console.error(ex);
      this.loggerService.logMessage(LogLevelEnum.ERROR, ex);
    }

  }

  async printReceiptViaPrinter() {
    await this.bluetoothPrintInvoiceService.print(this.transaction());
  }

  ngOnDestroy() {
    this._dialogRef = null;
    this._subscription.unsubscribe();
    this.store.dispatch(CustomerActions.resetCustomerState());
    this.store.dispatch(BarangayActions.resetBarangayState());
    this.store.dispatch(ProductTransactionActions.resetTransactionState());
  }

  private saveFormStateToStorage() {
    if (this._transactionId() !== 0) return;

    const formState = {
      invoiceNo: this._orderForm.get('invoiceNo').value,
      discount: this._discountForm.get('discount').value || 0,
      transactionDate: this._orderForm.get('transactionDate').value,
      dueDate: this._orderForm.get('dueDate').value,
      storeId: this._selectedCustomer()?.id,
      store: this._selectedCustomer(),
      modeOfPayment: this._orderForm.get('paymentMethod').value || 0
    };

    this.storageService.storeString(this.FORM_STORAGE_KEY, JSON.stringify(formState));
  }

  private clearFormStateFromStorage() {
    this.storageService.remove(this.FORM_STORAGE_KEY);
  }

  private saveDraftOrderToServer(transaction: TransactionDto) {
    this._subscription.add(
      this.transactionService
        .registerTransaction(transaction)
        .subscribe({
          next: (id: number) => {
            this.store.dispatch(
              ProductTransactionActions.setSaveOrderLoadingState({
                state: false,
              })
            );
            this.notificationService.openSuccessNotification(this._saveDraftSuccessMessage());
            this.store.dispatch(
              ProductTransactionActions.setSaveOrderLoadingState({
                state: false,
              })
            );
            this.clearFormStateFromStorage();
            this.checkAutoPrintReceipt(id);
          },

          error: () => {
            this.notificationService.openErrorNotification(this._saveDraftErrorMessage());

            this.store.dispatch(
              ProductTransactionActions.setSaveOrderLoadingState({
                state: false,
              })
            );
          },
        }));
  }

  saveBadOrderToServer(transaction: TransactionDto) {
    this._subscription.add(
      this.transactionService
        .registerTransaction(transaction)
        .subscribe({
          next: (id: number) => {
            this.notificationService.openSuccessNotification(this.translateService.instant(
              'PRODUCT_CART_PAGE.SAVE_NEW_BAD_ORDER_DIALOG.SUCCESS_MESSAGE'
            ));
            this.store.dispatch(
              ProductTransactionActions.setSaveOrderLoadingState({
                state: false,
              })
            );
            this.clearFormStateFromStorage();
            this.checkAutoPrintReceipt(id);
          },

          error: () => {
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

  private async saveLocalDraftOrder(transaction: TransactionDto) {
    const result = await this.localOrdersDbService.saveLocalOrder(TransactionStatusEnum.DRAFT, transaction);
    result.subscribe((id: number) => {
      this.notificationService.openSuccessNotification(this._saveDraftSuccessMessage());
      this.store.dispatch(
        ProductTransactionActions.setSaveOrderLoadingState({
          state: false,
        })
      );
      this.clearFormStateFromStorage();
      this.checkAutoPrintReceipt(id);
    });
  }

  private async saveLocalBadOrder(transaction: TransactionDto) {
    const result = await this.localOrdersDbService.saveLocalOrder(TransactionStatusEnum.BAD_ORDER, transaction);
    result.subscribe((id: number) => {
      this.notificationService.openSuccessNotification(this.translateService.instant(
        'PRODUCT_CART_PAGE.SAVE_NEW_BAD_ORDER_DIALOG.SUCCESS_MESSAGE'
      ));
      this.store.dispatch(
        ProductTransactionActions.setSaveOrderLoadingState({
          state: false,
        })
      );
      this.clearFormStateFromStorage();
      this.checkAutoPrintReceipt(id);
    });
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

    this.store.dispatch(
      ProductTransactionActions.setSaveOrderLoadingState({
        state: true,
      })
    );
    this.loaderLayoutComponent().label = this.translateService.instant('PRODUCT_CART_PAGE.SAVE_NEW_CONFIRMED_ORDER_DIALOG.LOADING_MESSAGE');
    this._subscription.add(this.transactionService
      .registerTransaction(transaction)
      .subscribe({
        next: (id: number) => {
          this.notificationService.openSuccessNotification(this.translateService.instant(
            'PRODUCT_CART_PAGE.SAVE_NEW_CONFIRMED_ORDER_DIALOG.SUCCESS_MESSAGE'
          ));
          this.store.dispatch(
            ProductTransactionActions.setSaveOrderLoadingState({
              state: false,
            })
          );
          this.sendOrderReceiptEmailNotification(id);
          this.sendInvoiceEmailNotification(id);
          this.clearFormStateFromStorage();
          this.checkAutoPrintReceipt(id);
        },

        error: () => {
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
      .sendOrderReceiptEmailNotification(transactionId)
      .subscribe();
  }

  private sendInvoiceEmailNotification(transactionId: number) {
    try {
      if (this.userService.userSetting().allowSendReceipt && this.userService.userSetting().allowAutoSendReceipt) {
        this.invoicePrintService
          .sendInvoice(transactionId, PrintForSettingsEnum.CUSTOMER, (file: File) => {
            this.transactionService.sendInvoiceTransaction(
              transactionId,
              this.authService.userId,
              file
            ).subscribe();
          });
      }
    } catch (ex) {
      console.error(ex);
      this.loggerService.logMessage(LogLevelEnum.ERROR, ex);
    }
  }

  private checkAutoPrintReceipt(id: number) {
    if (this._transactionId() === 0 && this.autoPrintReceipt()) {
      this.store.dispatch(
        ProductTransactionActions.getProductTransactions({
          transactionId: id,
          isLocalTransaction: this.isLocalTransaction(),
        })
      );
      this._printReceiptNow.set(true);
    } else {
      this.resetProductTransactions();
    }
  }

  private async printReceipt() {
    await this.printReceiptViaPrinter();
    this.resetProductTransactions();
  }

  private resetProductTransactions() {
    this.storageService.remove('productTransactions');
    this.clearFormStateFromStorage();
    this.store.dispatch(
      ProductTransactionActions.resetProductTransactionState()
    );

    if (this._transactionId() === 0) {
      this.router.navigate(['/product-catalogue']);
    } else {
      this.router.navigate(['/draft-transactions']);
    }
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
      this._totalAmount() - (discount / 100) * this._totalAmount() - this.transaction()?.badOrderAmount;
    return NumberFormatter.formatCurrency(calculatedNetTotalAmount);
  }

  get minDate(): Date {
    return this._orderForm.get('transactionDate').value;
  }

  get customerStoreOptions(): Array<CustomerStore> {
    const currentBarangay = this._orderForm.get('barangay').value.toLowerCase();
    return this._customerStoreOptions().filter((option) => {
      return (
        option.barangay?.name.toLowerCase().includes(currentBarangay) &&
        (this.isAdmin() || this.authService.user.value.id === option.barangay.userAccountId)
      );
    });
  };
}
