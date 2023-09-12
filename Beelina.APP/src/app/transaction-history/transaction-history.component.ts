import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import {
  TransactionDateInformation,
  TransactionService,
} from '../_services/transaction.service';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss'],
})
export class TransactionHistoryComponent implements OnInit {
  private _transactionHistoryDates: Array<TransactionDateInformation>;

  constructor(
    private router: Router,
    private transactionService: TransactionService
  ) {}

  ngOnInit() {
    this.transactionService
      .getApprovedTransactioHistoryDates()
      .subscribe(
        (transactionHistoryDates: Array<TransactionDateInformation>) => {
          this._transactionHistoryDates = transactionHistoryDates;
        }
      );
  }

  goToTransactionDate(transactionDate: Date) {
    const date = DateFormatter.format(transactionDate);
    this.router.navigate([`transaction-history/transactions/${date}`]);
  }

  get transactionHistoryDates(): Array<TransactionDateInformation> {
    return this._transactionHistoryDates;
  }
}
