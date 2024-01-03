import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import {
  Transaction,
  TransactionService,
} from 'src/app/_services/transaction.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { LoaderLayoutComponent } from 'src/app/shared/ui/loader-layout/loader-layout.component';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
})
export class TransactionDetailsComponent
  extends BaseComponent
  implements AfterViewInit {
  @ViewChild(LoaderLayoutComponent) loaderLayoutComponent: LoaderLayoutComponent;
  private _transactionId: number;
  private _transaction: Transaction;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private router: Router,
    private notificationService: NotificationService,
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

  markTransactionAsPaid() {
    this.dialogService
      .openConfirmation(
        this.translateService.instant(
          'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.TITLE'
        ),
        this.translateService.instant(
          'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.CONFIRM'
        )
      )
      .subscribe((result: ButtonOptions) => {
        if (result == ButtonOptions.YES) {
          this._isLoading = true;
          this.loaderLayoutComponent.label = this.translateService.instant('TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.LOADING_MESSAGE');
          this.transactionService
            .markTransactionAsPaid(this._transactionId)
            .subscribe({
              next: () => {
                this._isLoading = false;
                this.notificationService.openSuccessNotification(this.translateService.instant(
                  'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.SUCCESS_MESSAGE'
                ));
                this.router.navigate(['transaction-history']);
              },

              error: () => {
                this._isLoading = false;
                this.notificationService.openErrorNotification(this.translateService.instant(
                  'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.ERROR_MESSAGE'
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
