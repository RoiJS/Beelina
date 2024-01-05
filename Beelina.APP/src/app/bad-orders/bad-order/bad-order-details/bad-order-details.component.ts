import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import {
  Transaction,
  TransactionService,
} from 'src/app/_services/transaction.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';

import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { LoaderLayoutComponent } from 'src/app/shared/ui/loader-layout/loader-layout.component';

@Component({
  selector: 'app-bad-order-details',
  templateUrl: './bad-order-details.component.html',
  styleUrls: ['./bad-order-details.component.scss'],
})
export class BadOrderDetailsComponent extends BaseComponent implements AfterViewInit {
  @ViewChild(LoaderLayoutComponent) loaderLayoutComponent: LoaderLayoutComponent;
  private _transactionId: number;
  private _transaction: Transaction;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private router: Router,
    private transactionService: TransactionService,
    private translateService: TranslateService
  ) {
    super();
    this._transactionId = +this.activatedRoute.snapshot.paramMap.get('id');
    this._isLoading = true;
  }

  ngAfterViewInit() {
    this.loaderLayoutComponent.label = this.translateService.instant('LOADER_LAYOUT.LOADING_TEXT');
    this.transactionService
      .getTransaction(this._transactionId)
      .subscribe((transaction: Transaction) => {
        this._isLoading = false;
        this._transaction = transaction;
      });
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
          this.transactionService
            .deleteTransaction(this._transactionId)
            .subscribe({
              next: () => {
                this._isLoading = false;
                this.notificationService.openSuccessNotification(this.translateService.instant(
                  'BAD_ORDER_DETAILS_PAGE.DELETE_TRANSACTION_DIALOG.SUCCESS_MESSAGE'
                ));
                this.router.navigate([`bad-orders`]);
              },

              error: () => {
                this.notificationService.openErrorNotification(this.translateService.instant(
                  'BAD_ORDER_DETAILS_PAGE.DELETE_TRANSACTION_DIALOG.ERROR_MESSAGE'
                ));
              },
            });
        }
      });
  }

  get transaction(): Transaction {
    return this._transaction;
  }
}
