import { Component, OnInit } from '@angular/core';
import {
  TransactionDateInformation,
  TransactionService,
} from '../_services/transaction.service';
import { Router } from '@angular/router';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';

import { MainSharedComponent } from '../shared/components/main-shared/main-shared.component';

@Component({
  selector: 'app-draft-transactions',
  templateUrl: './draft-transactions.component.html',
  styleUrls: ['./draft-transactions.component.scss'],
})
export class DraftTransactionsComponent
  extends MainSharedComponent
  implements OnInit
{
  private _draftTransactionDates: Array<TransactionDateInformation>;

  constructor(
    private router: Router,
    private transactionService: TransactionService
  ) {
    super();
  }

  ngOnInit() {
    this._isLoading = true;
    this.transactionService
      .getDraftTransactioHistoryDates()
      .subscribe((draftTransactionDates: Array<TransactionDateInformation>) => {
        this._isLoading = false;
        this._draftTransactionDates = draftTransactionDates;
      });
  }

  goToTransactionDate(transactionDate: Date) {
    const date = DateFormatter.format(transactionDate);
    this.router.navigate([`draft-transactions/transactions/${date}`]);
  }

  get draftTransactionDates(): Array<TransactionDateInformation> {
    return this._draftTransactionDates;
  }
}
