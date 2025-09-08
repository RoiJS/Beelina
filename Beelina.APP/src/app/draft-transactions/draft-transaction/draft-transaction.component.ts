import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { from, map, switchMap } from 'rxjs';

import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';

import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { Transaction } from 'src/app/_models/transaction';

import { TransactionOptionsService } from 'src/app/_services/transaction-options.service';
import {
  TransactionService,
} from 'src/app/_services/transaction.service';
import { ConfirmOrdersDialogComponent } from '../confirm-orders-dialog/confirm-orders-dialog.component';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { LocalOrdersDbService } from 'src/app/_services/local-db/local-orders-db.service';
import { MultipleEntitiesService } from 'src/app/_services/multiple-entities.service';
import { NetworkService } from 'src/app/_services/network.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { ProductService } from 'src/app/_services/product.service';

import { InvalidProductTransactionOverallQuantitiesTransactions } from 'src/app/_models/insufficient-product-quantity';

@Component({
  selector: 'app-draft-transaction',
  templateUrl: './draft-transaction.component.html',
  styleUrls: [
    './draft-transaction.component.scss',
    '../../transaction-history/transaction-base-style.scss'
  ],
})
export class DraftTransactionComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  private _transactionDate: string;
  private _transactions: Array<Transaction>;
  private _dialogConfirmOrdersRef: MatBottomSheetRef<ConfirmOrdersDialogComponent>;

  activatedRoute = inject(ActivatedRoute);
  bottomSheet = inject(MatBottomSheet);
  dialogService = inject(DialogService);
  localOrdersDbService = inject(LocalOrdersDbService);
  multipleItemsService = inject(MultipleEntitiesService<Transaction>);
  notificationService = inject(NotificationService);
  networkService = inject(NetworkService);
  productService = inject(ProductService);
  router = inject(Router);
  store = inject(Store<AppStateInterface>);
  transactionService = inject(TransactionService);
  transactionOptionsService = inject(TransactionOptionsService);
  translateService = inject(TranslateService);

  constructor() {
    super();
    this.transactionOptionsService.setBottomSheet(this.bottomSheet);
    this.transactionOptionsService.optionDismissedSub.subscribe((data: boolean) => {
      if (data) {
        this.ngOnInit();
      }
    });
  }

  ngOnInit() {
    this._transactionDate = this.activatedRoute.snapshot.paramMap.get('date');
    this._isLoading = true;
    if (!this.networkService.isOnline.value) {
      from(this.localOrdersDbService.getMyLocalOrders(TransactionStatusEnum.DRAFT, [], [this._transactionDate]))
        .subscribe((localOrders: Array<Transaction>) => {
          this._transactions = localOrders;
          this._isLoading = false;
        });
    } else {
      this.transactionService
        .getTransactionsByDate(this._transactionDate, TransactionStatusEnum.DRAFT)
        .pipe(
          map((transactions: Array<Transaction>) => {
            return transactions;
          }),
          switchMap(async (onLineOrders) => {
            const offlineOrders = await this.localOrdersDbService.getMyLocalOrders(TransactionStatusEnum.DRAFT, [], [this._transactionDate]);
            this._isLoading = false;

            const allDraftTransactions = [
              ...onLineOrders,
              ...offlineOrders
            ];

            return allDraftTransactions;
          })
        ).subscribe((allDraftTransactions: Array<Transaction>) => {
          this._transactions = allDraftTransactions;
          this._isLoading = false;
        });
    }
  }

  ngOnDestroy() {
    this.multipleItemsService.reset();
    this.localOrdersDbService.reset();
  }

  goToTransaction(transaction: Transaction) {
    if (this.multipleItemsService.selectMultipleActive()) return;

    this.router.navigate([`/app/product-catalogue/product-cart/${transaction.id}`], {
      state: {
        isLocalTransaction: transaction.isLocal
      }
    });
  }

  openMenu(transaction: Transaction) {
    this.transactionOptionsService.openMenu(transaction);
  }

  deleteSelectedItems() {
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
          const onlineOrders = this.multipleItemsService.selectedItems().filter(i => !i.isLocal).map((i) => +i.id);
          const offlineOrders = this.multipleItemsService.selectedItems().filter(i => i.isLocal).map((i) => +i.id);

          this._isLoading = true;

          if (!this.networkService.isOnline.value) {
            this.localOrdersDbService
              .deleteLocalOrders(offlineOrders)
              .then(() => {
                this.notificationService.openSuccessNotification(this.translateService.instant(
                  'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_DIALOG.SUCCESS_MESSAGE'
                ));
                this._isLoading = false;
                this.multipleItemsService.reset();
                this.localOrdersDbService.reset()
                this.ngOnInit();
              });
          } else {
            from(this.localOrdersDbService.deleteLocalOrders(offlineOrders)).pipe(
              switchMap(() => this.transactionService.deleteTransactions(onlineOrders)),
            ).subscribe({
              next: () => {
                this.notificationService.openSuccessNotification(this.translateService.instant(
                  'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_DIALOG.SUCCESS_MESSAGE'
                ));
                this._isLoading = false;
                this.multipleItemsService.reset();
                this.localOrdersDbService.reset()
                this.ngOnInit();
              },

              error: () => {
                this.notificationService.openErrorNotification(this.translateService.instant(
                  'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_DIALOG.ERROR_MESSAGE'
                ));
                this.multipleItemsService.reset();
              },
            });
          }
        }
      });
  }

  confirmOrders() {
    const selectedItems = this.multipleItemsService.selectedItems().map((i) => +i.id);
    const offlineOrders = this.multipleItemsService.selectedItems().filter(i => i.isLocal);

    if (offlineOrders.length > 0) {
      this.notificationService.openErrorNotification(
        this.translateService.instant('DRAFT_TRANSACTIONS_PAGE.CONFIRM_MULTIPLE_ORDERS_DIALOG.ERROR_MESSAGE')
      );
      return;
    }

    this.productService
      .validateMultipleTransactionsProductQuantities(selectedItems)
      .subscribe((productsWithInsufficientQuantities: Array<InvalidProductTransactionOverallQuantitiesTransactions>) => {

        this._dialogConfirmOrdersRef = this.bottomSheet.open(ConfirmOrdersDialogComponent, {
          data: {
            selectedItems,
            productsWithInsufficientQuantities
          }
        });

        this._dialogConfirmOrdersRef
          .afterDismissed()
          .subscribe((result: {
            selectedItems: Array<number>,
            confirm: boolean,
            markAsPaid: boolean
          }) => {
            if (result && result.confirm) {
              this._isLoading = true;

              this.transactionService
                .setTransactionsStatus(result.selectedItems, TransactionStatusEnum.CONFIRMED, result.markAsPaid).subscribe({

                  next: () => {
                    this.notificationService.openSuccessNotification(
                      this.translateService.instant("DRAFT_TRANSACTIONS_PAGE.CONFIRM_ORDERS_DIALOG.SUCCESS_MESSAGE")
                    );
                    this._isLoading = false;
                    this.multipleItemsService.reset();
                    this.ngOnInit();
                  },

                  error: () => {
                    this._isLoading = false;
                    this.notificationService.openErrorNotification(
                      this.translateService.instant("DRAFT_TRANSACTIONS_PAGE.CONFIRM_ORDERS_DIALOG.ERROR_MESSAGE")
                    );
                  },
                });
            }
          });
      });
  }

  syncSelectedOfflineOrders() {
    const offlineOrderIds = this.multipleItemsService
      .selectedItems()
      .filter(i => i.isLocal)
      .map((i) => +i.id);

    if (offlineOrderIds.length === 0) {
      this.notificationService.openErrorNotification(
        this.translateService.instant('TRANSACTION_SELECT_MULTIPLE_MODE.SYNC_OFFLINE_ORDERS_DIALOG.WARNING_MESSAGE')
      );
      return;
    }

    this.dialogService
      .openConfirmation(
        this.translateService.instant(
          'TRANSACTION_SELECT_MULTIPLE_MODE.SYNC_OFFLINE_ORDERS_DIALOG.TITLE'
        ),
        this.translateService.instant(
          'TRANSACTION_SELECT_MULTIPLE_MODE.SYNC_OFFLINE_ORDERS_DIALOG.CONFIRM_MESSAGE'
        )
      )
      .subscribe((result: ButtonOptions) => {
        if (result == ButtonOptions.YES) {
          this._isLoading = true;
          this.localOrdersDbService
            .saveLocalOrdersToServer(TransactionStatusEnum.DRAFT, offlineOrderIds)
            .then(() => {
              this.notificationService.openSuccessNotification(this.translateService.instant(
                'TRANSACTION_SELECT_MULTIPLE_MODE.SYNC_OFFLINE_ORDERS_DIALOG.SUCCESS_MESSAGE'
              ));
              this._isLoading = false;
              this.multipleItemsService.reset();
              this.localOrdersDbService.reset()
              this.ngOnInit();
            });
        }
      });
  }

  selectAllItems(checked: boolean) {
    this.multipleItemsService.selectAllItems(checked, this.transactions);
  }

  selectItem(checked: boolean, id: string) {
    const transaction = this.transactions.filter((item) => item.id.toString() === id)[0];
    this.multipleItemsService.selectItem(checked, transaction, this.transactions);
  }

  get transationDate(): string {
    return DateFormatter.format(
      new Date(this._transactionDate),
      'MMM DD, YYYY'
    );
  }

  get transactions(): Array<Transaction> {
    return this._transactions;
  }
}
