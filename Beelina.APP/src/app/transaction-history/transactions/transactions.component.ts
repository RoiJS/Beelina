import { Component, inject, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';

import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';

import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';
import { Transaction } from 'src/app/_models/transaction';
import { TransactionOptionsService } from 'src/app/_services/transaction-options.service';
import {
  TransactionService,
} from 'src/app/_services/transaction.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent
  extends BaseComponent
  implements OnInit {
  private _transactionDate: string;
  private _transactions: Array<Transaction>;

  private activatedRoute = inject(ActivatedRoute);
  private bottomSheet = inject(MatBottomSheet);
  private router = inject(Router);
  private transactionService = inject(TransactionService);
  private transactionOptionsService = inject(TransactionOptionsService);

  constructor() {
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
        TransactionStatusEnum.CONFIRMED
      )
      .subscribe((transactions: Array<Transaction>) => {
        this._isLoading = false;
        this._transactions = transactions;
      });
  }

  goToTransaction(transactionId: number) {
    this.router.navigate([
      `/app/transaction-history/transactions/${this._transactionDate}/${transactionId}`,
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
