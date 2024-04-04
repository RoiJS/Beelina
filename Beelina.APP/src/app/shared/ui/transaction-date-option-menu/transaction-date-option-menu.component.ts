import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { TransactionDateInformation, TransactionService } from 'src/app/_services/transaction.service';
import { DialogService } from '../dialog/dialog.service';
import { NotificationService } from '../notification/notification.service';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';

import * as TransactionDateActions from '../../../transaction-history/store/actions';

@Component({
  selector: 'app-transaction-date-option-menu',
  templateUrl: './transaction-date-option-menu.component.html',
  styleUrls: ['./transaction-date-option-menu.component.scss']
})
export class TransactionDateOptionMenuComponent implements OnInit {

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<TransactionDateOptionMenuComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      transactionDateInformation: TransactionDateInformation,
      transactionStatus: TransactionStatusEnum
    },
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private router: Router,
    private transactionService: TransactionService,
    private translateService: TranslateService,
    private store: Store<AppStateInterface>
  ) {

  }

  ngOnInit() {
  }

  viewOrders() {
    // Format the transaction date as a string
    const formattedDate = DateFormatter.format(this.data.transactionDateInformation.transactionDate);

    let baseUrl = '';
    if (this.data.transactionStatus === TransactionStatusEnum.CONFIRMED) {
      baseUrl = 'transaction-history/transactions';
    } else if (this.data.transactionStatus === TransactionStatusEnum.BAD_ORDER) {
      baseUrl = 'bad-orders/transactions';
    } else if (this.data.transactionStatus === TransactionStatusEnum.DRAFT) {
      baseUrl = 'draft-transactions/transactions';
    }

    // Construct the URL for the transaction history page
    const url = `${baseUrl}/${formattedDate}`;

    // Navigate to the transaction history page
    this.router.navigate([url]);

    this._bottomSheetRef.dismiss();
  }

  deleteOrders() {
    this.dialogService
      .openConfirmation(
        this.translateService.instant(
          'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_BY_DATE_DIALOG.TITLE'
        ),
        this.translateService.instant(
          'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_BY_DATE_DIALOG.CONFIRM'
        )
      )
      .subscribe((result: ButtonOptions) => {
        if (result == ButtonOptions.YES) {
          this.store.dispatch(TransactionDateActions.setTransactionDatesLoadingState({ state: true }));
          const formattedDate = DateFormatter.format(this.data.transactionDateInformation.transactionDate);
          this.transactionService
            .deleteTransactionsByDate(
              this.data.transactionStatus,
              formattedDate)
            .subscribe({
              next: () => {
                this.store.dispatch(TransactionDateActions.setTransactionDatesLoadingState({ state: false }));
                this.notificationService.openSuccessNotification(this.translateService.instant(
                  'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_BY_DATE_DIALOG.SUCCESS_MESSAGE'
                ));
                this._bottomSheetRef.dismiss();
                this.store.dispatch(TransactionDateActions.resetTransactionDatesState());
                this.store.dispatch(TransactionDateActions.getTransactionDatesAction({ transactionStatus: this.data.transactionStatus }));
              },

              error: () => {
                this.notificationService.openErrorNotification(this.translateService.instant(
                  'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_BY_DATE_DIALOG.ERROR_MESSAGE'
                ));
              },
            });
        }
      });
  }
}
