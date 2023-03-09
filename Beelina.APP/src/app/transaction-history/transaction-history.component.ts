import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import {
  TransactionHistoryDate,
  TransactionService,
} from '../_services/transaction.service';

import { Transaction } from '../_services/transaction.service';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss'],
})
export class TransactionHistoryComponent implements OnInit {
  private _transactionHistoryDates: Array<TransactionHistoryDate>;

  constructor(
    private router: Router,
    private transactionService: TransactionService
  ) {}

  ngOnInit() {
    this.transactionService
      .getTransactioHistoryDates()
      .subscribe((transactionHistoryDates: Array<TransactionHistoryDate>) => {
        this._transactionHistoryDates = transactionHistoryDates;
      });

    // this.transactionService
    //   .getTransactionsByDate('2023-03-09')
    //   .subscribe((transactions: Array<Transaction>) => {
    //     console.log(transactions);
    //   });

    // this.transactionService
    //   .getTransaction(1015)
    //   .subscribe((transaction: Transaction) => {
    //     console.log(transaction);
    //   });
  }

  goToTransactionDate(transactionDate: Date) {
    const date = DateFormatter.format(transactionDate);
    this.router.navigate([`transaction-history/transactions/${date}`]);
  }

  get transactionHistoryDates(): Array<TransactionHistoryDate> {
    return this._transactionHistoryDates;
  }
}
