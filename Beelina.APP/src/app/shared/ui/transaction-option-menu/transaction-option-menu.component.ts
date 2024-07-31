import { Component, Inject, OnInit, signal } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { TransactionService } from 'src/app/_services/transaction.service';
import { DialogService } from '../dialog/dialog.service';
import { NotificationService } from '../notification/notification.service';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';

import * as TransactionDateActions from '../../../transaction-history/store/actions';
import { Transaction } from 'src/app/_models/transaction';
import { BaseComponent } from '../../components/base-component/base.component';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';

@Component({
  selector: 'app-transaction-option-menu',
  templateUrl: './transaction-option-menu.component.html',
  styleUrls: ['./transaction-option-menu.component.scss']
})
export class TransactionOptionMenuComponent extends BaseComponent implements OnInit {

  transaction = signal<Transaction>(new Transaction());

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<TransactionOptionMenuComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      transaction: Transaction
    },
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private router: Router,
    private store: Store<AppStateInterface>,
    private transactionService: TransactionService,
    private translateService: TranslateService,
  ) {
    super();

    this.transactionService
      .getTransaction(this.data.transaction.id)
      .subscribe((transaction: Transaction) => {
        this.transaction.set(transaction);
      });
  }

  ngOnInit() {

  }

  registerOrder() {
    const transactionDate = DateFormatter.format(this.transaction().transactionDate);
    this.router.navigate([`transaction-history/transactions/${transactionDate}/${this.transaction().id}/payments`], {
      state: {
        openRegisterDialog: true
      }
    });
  }

  deleteOrder() {
    this.dialogService
      .openConfirmation(
        this.translateService.instant(
          'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_DIALOG.TITLE'
        ),
        this.translateService.instant(
          'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_DIALOG.CONFIRM'
        )
      )
      .subscribe((result: ButtonOptions) => {
        if (result == ButtonOptions.YES) {
          this.store.dispatch(TransactionDateActions.setTransactionDatesLoadingState({ state: true }));
          this.transactionService
            .deleteTransactions([this.data.transaction.id])
            .subscribe({
              next: () => {
                this.notificationService.openSuccessNotification(this.translateService.instant(
                  'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_DIALOG.SUCCESS_MESSAGE'
                ));

                this._bottomSheetRef.dismiss(true);
              },

              error: () => {
                this.notificationService.openErrorNotification(this.translateService.instant(
                  'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_DIALOG.ERROR_MESSAGE'
                ));
              },
            });
        }
      });
  }
}
