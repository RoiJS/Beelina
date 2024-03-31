import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';

import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';
import { TransactionOptionsService } from 'src/app/_services/transaction-options.service';
import {
  Transaction,
  TransactionService,
} from 'src/app/_services/transaction.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

@Component({
  selector: 'app-bad-order',
  templateUrl: './bad-order.component.html',
  styleUrls: ['./bad-order.component.scss'],
})
export class BadOrderComponent extends BaseComponent implements OnInit {
  private _transactionDate: string;
  private _transactions: Array<Transaction>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private bottomSheet: MatBottomSheet,
    private router: Router,
    private transactionService: TransactionService,
    private transactionOptionsService: TransactionOptionsService
  ) {
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
      .getTransactionsByDate(
        this._transactionDate,
        TransactionStatusEnum.BAD_ORDER
      )
      .subscribe((transactions: Array<Transaction>) => {
        this._isLoading = false;
        this._transactions = transactions;
      });
  }

  goToTransaction(transactionId: number) {
    this.router.navigate([
      `bad-orders/transactions/${this._transactionDate}/${transactionId}`,
    ]);
  }

  openMenu(transaction: Transaction) {
    this.transactionOptionsService.openMenu(transaction);
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
