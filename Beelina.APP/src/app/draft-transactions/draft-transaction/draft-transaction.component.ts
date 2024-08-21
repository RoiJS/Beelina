import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';

import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { Transaction } from 'src/app/_models/transaction';

import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { MultipleItemsService } from 'src/app/_services/multiple-items.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { TransactionOptionsService } from 'src/app/_services/transaction-options.service';
import {
  TransactionService,
} from 'src/app/_services/transaction.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { ProductService } from 'src/app/_services/product.service';
import { InvalidProductTransactionOverallQuantitiesTransactions } from 'src/app/_models/insufficient-product-quantity';
import { ConfirmOrdersDialogComponent } from '../confirm-orders-dialog/confirm-orders-dialog.component';

@Component({
  selector: 'app-draft-transaction',
  templateUrl: './draft-transaction.component.html',
  styleUrls: ['./draft-transaction.component.scss'],
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
  multipleItemsService = inject(MultipleItemsService);
  notificationService = inject(NotificationService);
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
    this.transactionService
      .getTransactionsByDate(this._transactionDate, TransactionStatusEnum.DRAFT)
      .subscribe((transactions: Array<Transaction>) => {
        this._isLoading = false;
        this._transactions = transactions;
      });
  }

  ngOnDestroy() {
    this.multipleItemsService.reset();
  }

  goToTransaction(transactionId: number) {
    if (this.multipleItemsService.selectMultipleActive()) return;

    this.router.navigate([`product-catalogue/product-cart/${transactionId}`]);
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
          const orders = this.multipleItemsService.selectedItems().map((id) => +id);
          this._isLoading = true;
          this.transactionService
            .deleteTransactions(orders)
            .subscribe({
              next: () => {
                this.notificationService.openSuccessNotification(this.translateService.instant(
                  'TRANSACTION_OPTION_MENU.DELETE_TRANSACTION_DIALOG.SUCCESS_MESSAGE'
                ));
                this._isLoading = false;
                this.multipleItemsService.reset();
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
      });
  }

  confirmOrders() {
    let selectedItems = this.multipleItemsService.selectedItems().map(Number);
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
            confirm: boolean
          }) => {
            if (result && result.confirm) {
              this._isLoading = true;
              this.transactionService
                .setTransactionsStatus(result.selectedItems, TransactionStatusEnum.CONFIRMED).subscribe({
                  next: () => {
                    this.notificationService.openSuccessNotification(
                      this.translateService.instant("DRAFT_TRANSACTIONS_PAGE.CONFIRM_ORDERS_DIALOG.SUCCESS_MESSAGE")
                    );
                    this._isLoading = false;
                    this.multipleItemsService.reset();
                    this.ngOnInit();
                  },


                  error: () => {
                    this.notificationService.openErrorNotification(
                      this.translateService.instant("DRAFT_TRANSACTIONS_PAGE.CONFIRM_ORDERS_DIALOG.ERROR_MESSAGE")
                    );
                  },
                });
            }
          });
      });
  }

  selectAllItems(checked: boolean) {
    const items = this.transactions.map((item) => item.id.toString());
    this.multipleItemsService.selectAllItems(checked, items);
  }

  selectItem(checked: boolean, id: string) {
    this.multipleItemsService.selectItem(checked, id, this.transactions.length);
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
