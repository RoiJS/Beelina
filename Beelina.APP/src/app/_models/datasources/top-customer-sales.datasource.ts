import { DestroyRef, effect, inject } from '@angular/core';

import { BaseDataSource } from './base.datasource';
import { CustomerSale } from '../../_services/transaction.service';
import { TopCustomerSalesStore } from 'src/app/admin-dashboard/insights/top-customer-sales/top-customer-sales.store';


export class TopCustomerSalesDataSource extends BaseDataSource<CustomerSale> {

  topCustomerSalesStore = inject(TopCustomerSalesStore);
  private destroyRef = inject(DestroyRef);

  constructor() {
    super();
    this.topCustomerSalesStore.getTopCustomerSales();
    const effectRef = effect(() => {
      this._dataStream.next(this.topCustomerSalesStore.topCustomerSales());
    });

    this.destroyRef.onDestroy(() => {
      effectRef.destroy();
    });
  }

  override fetchData() {
    this.topCustomerSalesStore.getTopCustomerSales();
  }
}
