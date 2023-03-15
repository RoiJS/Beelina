import { Component, OnInit } from '@angular/core';

import {
  TransactionService,
  TransactionTopProduct,
} from 'src/app/_services/transaction.service';

@Component({
  selector: 'app-top-products',
  templateUrl: './top-products.component.html',
  styleUrls: ['./top-products.component.scss'],
})
export class TopProductsComponent implements OnInit {
  private _topProducts: Array<TransactionTopProduct>;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.transactionService
      .getTopProducts()
      .subscribe((topProducts: Array<TransactionTopProduct>) => {
        this._topProducts = topProducts;
      });
  }

  get topProducts(): Array<TransactionTopProduct> {
    return this._topProducts;
  }
}
