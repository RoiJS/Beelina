import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { DialogService } from '../dialog/dialog.service';
import { LocalOrdersDbService } from 'src/app/_services/local-db/local-orders-db.service';
import { NotificationService } from '../notification/notification.service';
import { TransactionService } from 'src/app/_services/transaction.service';
import { UserAccountService } from 'src/app/_services/user-account.service';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';

import * as TransactionDateActions from '../../../transaction-history/store/actions';
import { Transaction } from 'src/app/_models/transaction';
import { BaseComponent } from '../../components/base-component/base.component';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';
import { NetworkService } from 'src/app/_services/network.service';

@Component({
  selector: 'app-transaction-option-menu',
  templateUrl: './transaction-option-menu.component.html',
  styleUrls: ['./transaction-option-menu.component.scss']
})
export class TransactionOptionMenuComponent extends BaseComponent implements OnInit {

  transaction = signal<Transaction>(new Transaction());
  userService = inject(UserAccountService);

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<TransactionOptionMenuComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      transaction: Transaction
    },
    private dialogService: DialogService,
    private localOrdersDbService: LocalOrdersDbService,
    private notificationService: NotificationService,
    private networkService: NetworkService,
    private router: Router,
    private store: Store<AppStateInterface>,
    private transactionService: TransactionService,
    private translateService: TranslateService,
  ) {
    super();

    if (!this.data.transaction.isLocal) {
      this.transactionService
        .getTransaction(this.data.transaction.id)
        .subscribe((transaction: Transaction) => {
          this.transaction.set(transaction);
        });
    } else {
      this.localOrdersDbService
        .getMyLocalOrders(this.data.transaction.status, [this.data.transaction.id])
        .then((transaction: Array<Transaction>) => {
          this.transaction.set(transaction[0]);
        });
    }
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

          if (!this.data.transaction.isLocal) {
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
          } else {
            this.localOrdersDbService
              .deleteLocalOrders([this.data.transaction.id]).then(() => {
                this.notificationService.openSuccessNotification(this.translateService.instant(
                  'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_DIALOG.SUCCESS_MESSAGE'
                ));

                this._bottomSheetRef.dismiss(true);
              }).catch(() => {
                this.notificationService.openErrorNotification(this.translateService.instant(
                  'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_DIALOG.ERROR_MESSAGE'
                ));
              });
          }
        }
      });
  }

  async syncLocalOrder() {
    this.dialogService
      .openConfirmation(
        this.translateService.instant("DRAFT_TRANSACTIONS_PAGE.SYNC_OFFLINE_ORDER_DIALOG.TITLE"),
        this.translateService.instant("DRAFT_TRANSACTIONS_PAGE.SYNC_OFFLINE_ORDER_DIALOG.CONFIRM_MESSAGE"),
      )
      .subscribe(async (result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          await this.localOrdersDbService.saveLocalOrdersToServer(this.data.transaction.status, [this.data.transaction.id]);

          this.notificationService.openSuccessNotification(this.translateService.instant(
            "DRAFT_TRANSACTIONS_PAGE.SYNC_OFFLINE_ORDER_DIALOG.SUCCESS_MESSAGE"
          ));

          this._bottomSheetRef.dismiss(true);
        }
      });
  }

  get isOnline() {
    return this.networkService.isOnline.value;
  }
}
