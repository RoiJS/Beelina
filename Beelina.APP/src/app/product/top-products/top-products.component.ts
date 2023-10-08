import { Component, OnInit } from '@angular/core';

import {
  TransactionService,
  TransactionTopProduct,
} from 'src/app/_services/transaction.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

@Component({
  selector: 'app-top-products',
  templateUrl: './top-products.component.html',
  styleUrls: ['./top-products.component.scss'],
})
export class TopProductsComponent
  extends BaseComponent
  implements OnInit
{
  private _topProducts: Array<TransactionTopProduct>;

  constructor(private transactionService: TransactionService) {
    super();
  }

  ngOnInit() {
    this._isLoading = true;
    this.transactionService
      .getTopProducts()
      .subscribe((topProducts: Array<TransactionTopProduct>) => {
        this._isLoading = false;
        this._topProducts = topProducts;
      });
  }

  get topProducts(): Array<TransactionTopProduct> {
    return this._topProducts;
  }
}
