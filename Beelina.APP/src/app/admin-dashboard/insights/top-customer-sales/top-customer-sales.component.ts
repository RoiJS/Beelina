import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { CustomerSale, CustomerSaleProduct, TransactionService } from 'src/app/_services/transaction.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

@Component({
  selector: 'app-top-customer-sales',
  templateUrl: './top-customer-sales.component.html',
  styleUrls: ['./top-customer-sales.component.scss']
})
export class TopCustomerSalesComponent extends BaseComponent implements OnInit, OnDestroy {

  private _customerSales: Array<CustomerSale> = [];
  private _customerSalesProducts: Array<CustomerSaleProduct> = [];
  private _subscription = new Subscription();

  constructor(
    private transactionService: TransactionService
  ) { super(); }

  ngOnInit() {
    this._subscription.add(this.transactionService
      .getTopStoresSales(0)
      .subscribe((data: Array<CustomerSale>) => {
        this._customerSales = data.splice(0, 5);
      }));
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  showTopProducts(storeId: number) {
    this._subscription.add(this.transactionService
      .getStoresSalesProducts(storeId)
      .subscribe((data: Array<CustomerSaleProduct>) => {
        this._customerSalesProducts = data;
      }));
  }

  goBack() {
    this._customerSalesProducts = [];
  }

  get customerSales(): Array<CustomerSale> {
    return this._customerSales;
  }

  get customerSalesProducts(): Array<CustomerSaleProduct> {
    return this._customerSalesProducts;
  }
}
