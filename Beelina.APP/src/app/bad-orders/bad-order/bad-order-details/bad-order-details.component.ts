import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import {
  Transaction,
  TransactionService,
} from 'src/app/_services/transaction.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

@Component({
  selector: 'app-bad-order-details',
  templateUrl: './bad-order-details.component.html',
  styleUrls: ['./bad-order-details.component.scss'],
})
export class BadOrderDetailsComponent extends BaseComponent implements OnInit {
  private _transactionId: number;
  private _transaction: Transaction;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private router: Router,
    private snackBarService: MatSnackBar,
    private transactionService: TransactionService,
    private translateService: TranslateService
  ) {
    super();
  }

  ngOnInit() {
    this._transactionId = +this.activatedRoute.snapshot.paramMap.get('id');

    this._isLoading = true;
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
          this.transactionService
            .deleteTransaction(this._transactionId)
            .subscribe({
              next: () => {
                this.snackBarService.open(
                  this.translateService.instant(
                    'BAD_ORDER_DETAILS_PAGE.DELETE_TRANSACTION_DIALOG.SUCCESS_MESSAGE'
                  ),
                  this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                  {
                    duration: 5000,
                  }
                );

                this.router.navigate([`bad-orders`]);
              },

              error: () => {
                this.snackBarService.open(
                  this.translateService.instant(
                    'BAD_ORDER_DETAILS_PAGE.DELETE_TRANSACTION_DIALOG.ERROR_MESSAGE'
                  ),
                  this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                  {
                    duration: 5000,
                  }
                );
              },
            });
        }
      });
  }

  get transaction(): Transaction {
    return this._transaction;
  }
}
