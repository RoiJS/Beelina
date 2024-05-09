import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { PaymentMethod } from 'src/app/_models/payment-method';
import {
  TransactionService,
} from 'src/app/_services/transaction.service';
import { paymentMethodsSelector } from 'src/app/payment-methods/store/selectors';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { LoaderLayoutComponent } from 'src/app/shared/ui/loader-layout/loader-layout.component';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import * as PaymentMethodActions from '../../../payment-methods/store/actions';
import { Transaction } from 'src/app/_models/transaction';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
})
export class TransactionDetailsComponent
  extends BaseComponent
  implements AfterViewInit, OnDestroy {
  @ViewChild(LoaderLayoutComponent) loaderLayoutComponent: LoaderLayoutComponent;
  private _transactionId: number;
  private _transaction: Transaction;
  private _paymentMethodOptions: PaymentMethod[];
  private _subscription: Subscription = new Subscription();
  private _transactionForm: FormGroup;

  constructor(
    private activatedRoute: ActivatedRoute,
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
    this._isLoading = true;

    this.store.dispatch(PaymentMethodActions.getPaymentMethodsAction());

    this._subscription.add(this.store
      .pipe(select(paymentMethodsSelector))
      .subscribe((paymentMethods: Array<PaymentMethod>) => {
        this._paymentMethodOptions = paymentMethods;
      }));
  }

  ngAfterViewInit() {
    this.loaderLayoutComponent.label = this.translateService.instant('LOADER_LAYOUT.LOADING_TEXT');
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
          this.loaderLayoutComponent.label = this.translateService.instant('TRANSACTION_DETAILS_PAGE.UPDATE_MODE_OF_PAYMENT_DIALOG.LOADING_MESSAGE');
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
