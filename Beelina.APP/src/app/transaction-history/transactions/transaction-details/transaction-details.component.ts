import { AfterViewInit, Component, inject, OnDestroy, viewChild } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { PaymentMethod } from 'src/app/_models/payment-method';
import { paymentMethodsSelector } from 'src/app/payment-methods/store/selectors';
import { AuthService } from 'src/app/_services/auth.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { InvoicePrintService } from 'src/app/_services/print/invoice-print.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { UserAccountService } from 'src/app/_services/user-account.service';
import {
  TransactionService,
} from 'src/app/_services/transaction.service';

import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { LoaderLayoutComponent } from 'src/app/shared/ui/loader-layout/loader-layout.component';

import * as PaymentMethodActions from '../../../payment-methods/store/actions';
import { Transaction } from 'src/app/_models/transaction';
import { PrintForSettingsEnum } from 'src/app/_enum/print-for-settings.enum';
import { SendInvoiceOptionDialogComponent } from 'src/app/product/product-cart/send-invoice-option-dialog/send-invoice-option-dialog.component';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
})
export class TransactionDetailsComponent
  extends BaseComponent
  implements AfterViewInit, OnDestroy {
  loaderLayoutComponent = viewChild(LoaderLayoutComponent);

  private _transactionId: number;
  private _transactionDate: string;
  private _transaction: Transaction;
  private _paymentMethodOptions: PaymentMethod[];
  private _subscription: Subscription = new Subscription();
  private _transactionForm: FormGroup;
  private _dialogSendInvoiceOptionRef: MatBottomSheetRef<SendInvoiceOptionDialogComponent>;

  bottomSheet = inject(MatBottomSheet);
  invoicePrintService = inject(InvoicePrintService);
  userService = inject(UserAccountService);

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
    private notificationService: NotificationService,
    private transactionService: TransactionService,
    private translateService: TranslateService,
    private store: Store<AppStateInterface>
  ) {
    super();
    this._transactionForm = this.formBuilder.group({
      paymentMethod: [0, Validators.required],
    });

    this._transactionId = +this.activatedRoute.snapshot.paramMap.get('id');
    this._transactionDate = this.activatedRoute.snapshot.paramMap.get('date');
    this._isLoading = true;

    this.store.dispatch(PaymentMethodActions.getPaymentMethodsAction());

    this._subscription.add(this.store
      .pipe(select(paymentMethodsSelector))
      .subscribe((paymentMethods: Array<PaymentMethod>) => {
        this._paymentMethodOptions = paymentMethods;
      }));
  }

  ngAfterViewInit() {
    this.loaderLayoutComponent().label = this.translateService.instant('LOADER_LAYOUT.LOADING_TEXT');
    this.transactionService
      .getTransaction(this._transactionId)
      .subscribe((transaction: Transaction) => {
        this._isLoading = false;
        this._transaction = transaction;
        this._transactionForm.get('paymentMethod').setValue(transaction.modeOfPayment);
      });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  saveTransaction() {
    this.dialogService
      .openConfirmation(
        this.translateService.instant(
          'TRANSACTION_DETAILS_PAGE.UPDATE_MODE_OF_PAYMENT_DIALOG.TITLE'
        ),
        this.translateService.instant(
          'TRANSACTION_DETAILS_PAGE.UPDATE_MODE_OF_PAYMENT_DIALOG.CONFIRM'
        )
      )
      .subscribe((result: ButtonOptions) => {
        if (result == ButtonOptions.YES) {
          this._isLoading = true;
          this.loaderLayoutComponent().label = this.translateService.instant('TRANSACTION_DETAILS_PAGE.UPDATE_MODE_OF_PAYMENT_DIALOG.LOADING_MESSAGE');
          const modeOfPayment = +this._transactionForm.get('paymentMethod').value;
          this.transactionService
            .updateModeOfPayment(this._transactionId, modeOfPayment)
            .subscribe({
              next: () => {
                this._isLoading = false;
                this.notificationService.openSuccessNotification(this.translateService.instant(
                  'TRANSACTION_DETAILS_PAGE.UPDATE_MODE_OF_PAYMENT_DIALOG.SUCCESS_MESSAGE'
                ));
                this.router.navigate(['transaction-history']);
              },

              error: () => {
                this._isLoading = false;
                this.notificationService.openErrorNotification(this.translateService.instant(
                  'TRANSACTION_DETAILS_PAGE.UPDATE_MODE_OF_PAYMENT_DIALOG.ERROR_MESSAGE'
                ));
              },
            });
        }
      });
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
            .markTransactionsAsPaid([this._transactionId], paid)
            .subscribe({
              next: () => {
                this._isLoading = false;
                this.notificationService.openSuccessNotification(successMessage);
                this.router.navigate(['transaction-history']);
              },

              error: () => {
                this._isLoading = false;
                this.notificationService.openErrorNotification(errorMessage);
              },
            });
        }
      });
  }

  registerPayment() {
    this.router.navigate([`transaction-history/transactions/${this._transactionDate}/${this._transactionId}/payments`], {
      state: {
        openRegisterDialog: true
      }
    });
  }

  goToPaymentHistory() {
    this.router.navigate([`transaction-history/transactions/${this._transactionDate}/${this._transactionId}/payments`], {
      state: {
        openRegisterDialog: false
      }
    });
  }

  sendInvoice() {
    this._dialogSendInvoiceOptionRef = this.bottomSheet.open(SendInvoiceOptionDialogComponent);

    this._dialogSendInvoiceOptionRef
      .afterDismissed()
      .subscribe(
        async (data: {
          printForSettingsEnum: PrintForSettingsEnum;
        }) => {
          if (!data) return;

          this._isLoading = true;
          this.invoicePrintService
            .sendInvoice(this._transactionId, data.printForSettingsEnum, (file: File) => {
              this.transactionService.sendInvoiceTransaction(
                this._transactionId,
                this.authService.userId,
                file
              ).subscribe({
                next: (result: boolean) => {
                  this._isLoading = false;
                  if (result) {
                    this.notificationService.openSuccessNotification(this.translateService.instant('PRODUCT_CART_PAGE.SEND_VIA_EMAIL_OPTION_DIALOG.SUCCESS_MESSAGE'));
                  } else {
                    this.notificationService.openErrorNotification(this.translateService.instant('PRODUCT_CART_PAGE.SEND_VIA_EMAIL_OPTION_DIALOG.ERROR_MESSAGE'));
                  }
                },
                error: () => {
                  this.notificationService.openErrorNotification(this.translateService.instant('PRODUCT_CART_PAGE.SEND_VIA_EMAIL_OPTION_DIALOG.ERROR_MESSAGE'));
                }
              });
            });
        }
      );
  }

  get transactionForm(): FormGroup {
    return this._transactionForm;
  }

  get paymentMethodOptions(): Array<PaymentMethod> {
    return this._paymentMethodOptions;
  }

  get transaction(): Transaction {
    return this._transaction;
  }
}
