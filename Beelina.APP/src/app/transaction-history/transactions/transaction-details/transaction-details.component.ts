import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NumberFormatter } from 'src/app/_helpers/formatters/number-formatter.helper';
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
  private _totalAmount: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionService
  ) {}

  ngOnInit() {
    this._transactionId = +this.activatedRoute.snapshot.paramMap.get('id');

    this.transactionService
      .getTransaction(this._transactionId)
      .subscribe((transaction: Transaction) => {
        this._transaction = transaction;
        console.log(transaction);
        this._totalAmount = this._transaction.productTransactions.reduce(
          (t, n) => t + n.product.price * n.quantity,
          0
        );
      });
  }

  get transaction(): Transaction {
    return this._transaction;
  }

  get totalAmount(): string {
    return NumberFormatter.formatCurrency(this._totalAmount);
  }
}
