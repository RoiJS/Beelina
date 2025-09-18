import { effect, inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { BaseFilterAndSortService } from './base-filter-and-sort.service';
import { StorageService } from './storage.service';
import { AppStateInterface } from '../_interfaces/app-state.interface';
import { CustomerSale } from './transaction.service';

import { SortOrderOptionsEnum } from '../_enum/sort-order-options.enum';
import { TopCustomerSalesStore } from '../admin-dashboard/insights/top-customer-sales/top-customer-sales.store';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';

@Injectable({
  providedIn: 'root'
})
export class TopCustomerSalesFilterService extends BaseFilterAndSortService<CustomerSale> {

  private topCustomerSalesStore = inject(TopCustomerSalesStore);

  constructor(protected override storageService: StorageService,
    protected override store: Store<AppStateInterface>) {
    super(storageService, store);
  }

  override setPropsSubscriptions(defaultSortOrder: string, defaultFromDate: string, defaultToDate: string) {
      // Always Set to current month: first day and last day
      const currentMonthDatePeriod = DateFormatter.currentMonthDatePeriod();
      defaultFromDate = currentMonthDatePeriod.fromDate;
      defaultToDate = currentMonthDatePeriod.toDate;

    // Subscribe to filter properties updates
    effect(() => {
      this._fromDate = this.topCustomerSalesStore.fromDate();
      this._toDate = this.topCustomerSalesStore.toDate();
      this._sortOrder = this.topCustomerSalesStore.sortOrder();
    });

    this.dispatchFilter({
      sortOrder: <SortOrderOptionsEnum>defaultSortOrder,
      dateFrom: defaultFromDate,
      dateTo: defaultToDate,
    });
  }

  override resetFilter() {
    this.topCustomerSalesStore.resetList();
  }

  override dispatchFilter(data: {
    dateFrom: string;
    dateTo: string;
    sortOrder: SortOrderOptionsEnum;
  }) {
    this.topCustomerSalesStore.setSortAndfilterTopCustomerSalesDates(data.sortOrder, data.dateFrom, data.dateTo);
  }
}
