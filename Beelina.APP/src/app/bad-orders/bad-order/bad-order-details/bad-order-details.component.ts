import { AfterViewInit, Component, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import {
  TransactionService,
} from 'src/app/_services/transaction.service';
import { LocalOrdersDbService } from 'src/app/_services/local-db/local-orders-db.service';
import { NetworkService } from 'src/app/_services/network.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';

import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { LoaderLayoutComponent } from 'src/app/shared/ui/loader-layout/loader-layout.component';
import { Transaction } from 'src/app/_models/transaction';
import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';

@Component({
  selector: 'app-bad-order-details',
  templateUrl: './bad-order-details.component.html',
  styleUrls: ['./bad-order-details.component.scss'],
})
export class BadOrderDetailsComponent extends BaseComponent implements AfterViewInit {
  @ViewChild(LoaderLayoutComponent) loaderLayoutComponent: LoaderLayoutComponent;
  private _transactionId: number;
  private _transaction: Transaction;
  isLocalTransaction = signal<boolean>(false);

  constructor(
    public networkService: NetworkService,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private localOrdersDbService: LocalOrdersDbService,
    private notificationService: NotificationService,
    private router: Router,
    private transactionService: TransactionService,
    private translateService: TranslateService
  ) {
    super();
    this._transactionId = +this.activatedRoute.snapshot.paramMap.get('id');
    const routerData = <{ isLocalTransaction: boolean }>this.router.getCurrentNavigation()?.extras?.state;
    this.isLocalTransaction.set(routerData?.isLocalTransaction);

    this._isLoading = true;
  }

  ngAfterViewInit() {
    this.loaderLayoutComponent.label = this.translateService.instant('LOADER_LAYOUT.LOADING_TEXT');

    if (!this.isLocalTransaction()) {
      this.transactionService
        .getTransaction(this._transactionId)
        .subscribe((transaction: Transaction) => {
          this._isLoading = false;
          this._transaction = transaction;
        });
    } else {
      this.localOrdersDbService
        .getMyLocalOrders(TransactionStatusEnum.BAD_ORDER, [this._transactionId])
        .then((transaction: Array<Transaction>) => {
          this._isLoading = false;
          this._transaction = transaction[0];
        });
    }
  }

  deleteTransaction() {
    this.dialogService
      .openConfirmation(
        this.translateService.instant(
          'BAD_ORDER_DETAILS_PAGE.DELETE_TRANSACTION_DIALOG.TITLE'
        ),
        this.translateService.instant(
          'BAD_ORDER_DETAILS_PAGE.DELETE_TRANSACTION_DIALOG.CONFIRM'
        )
      )
      .subscribe((result: ButtonOptions) => {
        if (result == ButtonOptions.YES) {
          this._isLoading = true;
          this.loaderLayoutComponent.label = this.translateService.instant('BAD_ORDER_DETAILS_PAGE.DELETE_TRANSACTION_DIALOG.LOADING_MESSAGE');

          if (!this.isLocalTransaction()) {
            this.transactionService
              .deleteTransactions([this._transactionId])
              .subscribe({
                next: () => {
                  this._isLoading = false;
                  this.notificationService.openSuccessNotification(this.translateService.instant(
                    'BAD_ORDER_DETAILS_PAGE.DELETE_TRANSACTION_DIALOG.SUCCESS_MESSAGE'
                  ));
                  this.router.navigate([`bad-orders`]);
                },

                error: () => {
                  this._isLoading = false;
                  this.notificationService.openErrorNotification(this.translateService.instant(
                    'BAD_ORDER_DETAILS_PAGE.DELETE_TRANSACTION_DIALOG.ERROR_MESSAGE'
                  ));
                },
              });
          } else {
            this.localOrdersDbService
              .deleteLocalOrders([this._transactionId]).then(() => {
                this._isLoading = false;
                this.notificationService.openSuccessNotification(this.translateService.instant(
                  'BAD_ORDER_DETAILS_PAGE.DELETE_TRANSACTION_DIALOG.SUCCESS_MESSAGE'
                ));
                this.router.navigate([`bad-orders`]);

              }).catch(() => {
                this._isLoading = false;
                this.notificationService.openErrorNotification(this.translateService.instant(
                  'BAD_ORDER_DETAILS_PAGE.DELETE_TRANSACTION_DIALOG.ERROR_MESSAGE'
                ));
              });
          }
        }
      });
  }

  async syncLocalBadOrder() {
    this.dialogService
      .openConfirmation(
        this.translateService.instant("BAD_ORDER_DETAILS_PAGE.SYNC_OFFLINE_ORDER_DIALOG.TITLE"),
        this.translateService.instant("BAD_ORDER_DETAILS_PAGE.SYNC_OFFLINE_ORDER_DIALOG.CONFIRM_MESSAGE"),
      )
      .subscribe(async (result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this._isLoading = true;
          await this.localOrdersDbService.saveLocalOrdersToServer(TransactionStatusEnum.BAD_ORDER, [this._transactionId]);
          this.notificationService.openSuccessNotification(this.translateService.instant(
            "BAD_ORDER_DETAILS_PAGE.SYNC_OFFLINE_ORDER_DIALOG.SUCCESS_MESSAGE"
          ));

          this._isLoading = false;
          this.router.navigate([`bad-orders`]);
        }
      });
  }

  get transaction(): Transaction {
    return this._transaction;
  }
}
