import { Component, OnInit } from '@angular/core';
import {
  TransactionDateInformation,
  TransactionService,
} from '../_services/transaction.service';
import { Router } from '@angular/router';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';

@Component({
  selector: 'app-draft-transactions',
  templateUrl: './draft-transactions.component.html',
  styleUrls: ['./draft-transactions.component.scss'],
})
export class DraftTransactionsComponent implements OnInit {
  private _draftTransactionDates: Array<TransactionDateInformation>;

  constructor(
    private router: Router,
    private transactionService: TransactionService
  ) {}

  ngOnInit() {
    this.transactionService
      .getDraftTransactioHistoryDates()
      .subscribe(
        (draftTransactionDates: Array<TransactionDateInformation>) => {
          this._draftTransactionDates = draftTransactionDates;
        }
      );
  }

  goToTransactionDate(transactionDate: Date) {
    const date = DateFormatter.format(transactionDate);
    this.router.navigate([`draft-transactions/transactions/${date}`]);
  }

  get draftTransactionDates(): Array<TransactionDateInformation> {
    return this._draftTransactionDates;
  }
}
