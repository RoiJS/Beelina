import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';
import {
  Transaction,
  TransactionService,
} from 'src/app/_services/transaction.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

@Component({
  selector: 'app-draft-transaction',
  templateUrl: './draft-transaction.component.html',
  styleUrls: ['./draft-transaction.component.scss'],
})
export class DraftTransactionComponent
  extends BaseComponent
  implements OnInit
{
  private _transactionDate: string;
  private _transactions: Array<Transaction>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService
  ) {
    super();
  }

  ngOnInit() {
    this._transactionDate = this.activatedRoute.snapshot.paramMap.get('date');
    this._isLoading = true;
    this.transactionService
      .getTransactionsByDate(this._transactionDate, TransactionStatusEnum.DRAFT)
      .subscribe((transactions: Array<Transaction>) => {
        this._isLoading = false;
        this._transactions = transactions;
      });
  }

  goToTransaction(transactionId: number) {
    this.router.navigate([`product-catalogue/product-cart/${transactionId}`]);
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
