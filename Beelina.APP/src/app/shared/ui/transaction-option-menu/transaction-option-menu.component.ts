import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { TransactionService } from 'src/app/_services/transaction.service';
import { DialogService } from '../dialog/dialog.service';
import { NotificationService } from '../notification/notification.service';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';

import * as TransactionDateActions from '../../../transaction-history/store/actions';
import { Transaction } from 'src/app/_models/transaction';

@Component({
  selector: 'app-transaction-option-menu',
  templateUrl: './transaction-option-menu.component.html',
  styleUrls: ['./transaction-option-menu.component.scss']
})
export class TransactionOptionMenuComponent implements OnInit {

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<TransactionOptionMenuComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      transaction: Transaction
    },
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private transactionService: TransactionService,
    private translateService: TranslateService,
    private store: Store<AppStateInterface>
  ) {
  }

  ngOnInit() {

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
            .deleteTransaction(this.data.transaction.id)
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
