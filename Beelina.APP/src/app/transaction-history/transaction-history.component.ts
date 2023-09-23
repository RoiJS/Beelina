import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import {
  TransactionDateInformation,
  TransactionService,
} from '../_services/transaction.service';
import { MainSharedComponent } from '../shared/components/main-shared/main-shared.component';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss'],
})
export class TransactionHistoryComponent
  extends MainSharedComponent
  implements OnInit
{
  private _transactionHistoryDates: Array<TransactionDateInformation>;

  constructor(
    private router: Router,
    private transactionService: TransactionService
  ) {
    super();
  }

  ngOnInit() {
    this._isLoading = true;
    this.transactionService
      .getApprovedTransactioHistoryDates()
      .subscribe(
        (transactionHistoryDates: Array<TransactionDateInformation>) => {
          this._isLoading = false;
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
