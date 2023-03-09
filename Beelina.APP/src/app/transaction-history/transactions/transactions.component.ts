import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';
import {
  Transaction,
  TransactionService,
} from 'src/app/_services/transaction.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent implements OnInit {
  private _transactionDate: string;
  private _transactions: Array<Transaction>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService
  ) {}

  ngOnInit() {
    this._transactionDate = this.activatedRoute.snapshot.paramMap.get('date');

    this.transactionService
      .getTransactionsByDate(this._transactionDate)
      .subscribe((transactions: Array<Transaction>) => {
        this._transactions = transactions;
      });
  }

  goToTransaction(transactionId: number) {
    this.router.navigate([
      `transaction-history/transactions/${this._transactionDate}/${transactionId}`,
    ]);
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
