import { effect, inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { BaseFilterAndSortService } from './base-filter-and-sort.service';
import { StorageService } from './storage.service';
import { AppStateInterface } from '../_interfaces/app-state.interface';
import { TopSupplierBySales } from '../_models/top-supplier-by-sales';

import { SortOrderOptionsEnum } from '../_enum/sort-order-options.enum';
import { TopSupplierStore } from '../admin-dashboard/insights/top-suppliers-list/top-suppliers.store';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';

@Injectable({
  providedIn: 'root'
})
export class TopSuppliersFilterService extends BaseFilterAndSortService<TopSupplierBySales> {

  private topSupplierStore = inject(TopSupplierStore);

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
      this._fromDate = this.topSupplierStore.fromDate();
      this._toDate = this.topSupplierStore.toDate();
      this._sortOrder = this.topSupplierStore.sortOrder();
    });

    this.dispatchFilter({
      sortOrder: <SortOrderOptionsEnum>defaultSortOrder,
      dateFrom: defaultFromDate,
      dateTo: defaultToDate,
    });
  }

  override resetFilter() {
    this.topSupplierStore.resetList();
  }

  override dispatchFilter(data: {
    dateFrom: string;
    dateTo: string;
    sortOrder: SortOrderOptionsEnum;
  }) {
    this.topSupplierStore.setSortAndfilterTopSellingProductsDates(data.sortOrder, data.dateFrom, data.dateTo);
  }
}
