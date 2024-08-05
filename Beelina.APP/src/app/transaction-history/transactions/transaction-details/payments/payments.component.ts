import { Component, inject, OnInit, viewChild } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { PaymentService } from 'src/app/_services/payments.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { TransactionService } from 'src/app/_services/transaction.service';

import { Payment } from 'src/app/_models/payment';
import { Transaction } from 'src/app/_models/transaction';
import { PaymentStore } from './payments.store';
import { PaymentsDataSource } from 'src/app/_models/datasources/payments.datasource';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';

import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { RegisterPaymentDialogComponent } from '../register-payment-dialog/register-payment-dialog.component';
import { LoaderLayoutComponent } from 'src/app/shared/ui/loader-layout/loader-layout.component';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent extends BaseComponent implements OnInit {

  private _transactionId: number;

  loaderLayoutComponent = viewChild(LoaderLayoutComponent);
  dataSource: PaymentsDataSource;

  activatedRoute = inject(ActivatedRoute);
  bottomSheet = inject(MatBottomSheet);
  dialogService = inject(DialogService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  paymentService = inject(PaymentService);
  paymentStore = inject(PaymentStore);
  translateService = inject(TranslateService);
  transactionService = inject(TransactionService);

  private _dialogRegisterPaymentDialogRef: MatBottomSheetRef<
    RegisterPaymentDialogComponent,
    {
      payment: Payment;
    }
  >;;

  constructor() {
    super();
    const routerData = <{ openRegisterDialog: boolean }>this.router.getCurrentNavigation()?.extras?.state;
    const openRegisterDialog = routerData.openRegisterDialog;
    this._transactionId = +this.activatedRoute.snapshot.paramMap.get('id');
    this.dataSource = new PaymentsDataSource(this._transactionId);

    if (openRegisterDialog) {
      this.addPayment();
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.paymentStore.reset();
    this._dialogRegisterPaymentDialogRef = null;
  }

  addPayment() {
    const payment = new Payment();
    payment.transactionId = this._transactionId;
    this.openRegisterPaymentDialog(payment);
  }

  openPayment(payment: Payment) {
    this.openRegisterPaymentDialog(payment);
  }

  private openRegisterPaymentDialog(payment: Payment) {
    this.transactionService
      .getTransaction(this._transactionId)
      .subscribe((transaction: Transaction) => {
        this._dialogRegisterPaymentDialogRef = this.bottomSheet.open(RegisterPaymentDialogComponent, {
          data: {
            payment,
            transaction
          },
        });

        this._dialogRegisterPaymentDialogRef
          .afterDismissed()
          .subscribe(
            (data: {
              payment: Payment,
              paid: boolean
            }) => {
              if (!data || !data.payment || data.payment.id > 0) return;

              this.dialogService
                .openConfirmation(
                  this.translateService.instant("PAYMENTS_PAGE.SAVE_PAYMENT_DIALOG.TITLE"),
                  this.translateService.instant("PAYMENTS_PAGE.SAVE_PAYMENT_DIALOG.CONFIRM_MESSAGE")
                )
                .subscribe((result: ButtonOptions) => {
                  if (result === ButtonOptions.YES) {
                    this.registerPayment(data.payment, data.paid);
                  }
                });
            }
          );
      });
  }

  private registerPayment(payment: Payment, paid: boolean) {
    this.loaderLayoutComponent().label = this.translateService.instant('PAYMENTS_PAGE.SAVE_PAYMENT_DIALOG.LOADING_MESSAGE');
    this.paymentService.registerPayment(payment).subscribe({
      next: () => {
        if (paid) {
          this.markOrderPaid();
        } else {
          this.showSuccessMessage();
        }
      },
      error: (err) => {
        this.notificationService.openErrorNotification(this.translateService.instant("PAYMENTS_PAGE.SAVE_PAYMENT_DIALOG.ERROR_MESSAGE"));
      },
    });
  }

  private markOrderPaid() {
    this.loaderLayoutComponent().label = this.translateService.instant('TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.LOADING_MESSAGE');
    this.transactionService
      .markTransactionsAsPaid([this._transactionId], true)
      .subscribe({
         next: () => {
          this.showSuccessMessage();
        },
        error: () => {
          this.notificationService.openErrorNotification(this.translateService.instant('TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.ERROR_MESSAGE'));
        },
      });
  }

  private showSuccessMessage() {
    this.notificationService.openSuccessNotification(this.translateService.instant("PAYMENTS_PAGE.SAVE_PAYMENT_DIALOG.SUCCESS_MESSAGE"));
    this.paymentStore.reset();
    this.paymentStore.getPayments(this._transactionId);
  }
}
