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

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
})
export class TransactionDetailsComponent implements OnInit {
  private _transactionId: number;
  private _transaction: Transaction;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private router: Router,
    private snackBarService: MatSnackBar,
    private transactionService: TransactionService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this._transactionId = +this.activatedRoute.snapshot.paramMap.get('id');

    this.transactionService
      .getTransaction(this._transactionId)
      .subscribe((transaction: Transaction) => {
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
          this.transactionService
            .markTransactionAsPaid(this._transactionId)
            .subscribe({
              next: () => {
                this.snackBarService.open(
                  this.translateService.instant(
                    'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.SUCCESS_MESSAGE'
                  ),
                  this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                  {
                    duration: 5000,
                  }
                );

                this.router.navigate(['transaction-history']);
              },

              error: () => {
                this.snackBarService.open(
                  this.translateService.instant(
                    'TRANSACTION_DETAILS_PAGE.MARK_TRANSACTION_AS_PAID_DIALOG.ERROR_MESSAGE'
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
