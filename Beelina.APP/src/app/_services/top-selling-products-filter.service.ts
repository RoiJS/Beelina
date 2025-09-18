import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { BaseFilterAndSortService } from './base-filter-and-sort.service';
import { StorageService } from './storage.service';
import { AppStateInterface } from '../_interfaces/app-state.interface';

import { fromDateSelector, sortOrderSelector, toDateSelector } from '../product/top-products/store/selectors';
import * as TopSellingProductActions from '../product/top-products/store/actions';

import { SortOrderOptionsEnum } from '../_enum/sort-order-options.enum';
import { TopSellingProduct } from './transaction.service';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';

@Injectable({
  providedIn: 'root'
})
export class TopSellingProductsFilterService extends BaseFilterAndSortService<TopSellingProduct> {

  constructor(protected override storageService: StorageService,
    protected override store: Store<AppStateInterface>) {
    super(storageService, store);
  }

  override setPropsSubscriptions(defaultSortOrder: string, defaultFromDate: string, defaultToDate: string) {
    this.subscription = new Subscription();

    // Always Set to current month: first day and last day
    const currentMonthDatePeriod = DateFormatter.currentMonthDatePeriod();
    defaultFromDate = currentMonthDatePeriod.fromDate;
    defaultToDate = currentMonthDatePeriod.toDate;

    this.subscription.add(
      this.store.select(fromDateSelector).subscribe((fromDate) => {
        this._fromDate = fromDate;
      })
    );

    this.subscription.add(
      this.store.select(toDateSelector).subscribe((toDate) => {
        this._toDate = toDate;
      })
    );
    this.subscription.add(
      this.store.select(sortOrderSelector).subscribe((sortOrder) => {
        this._sortOrder = sortOrder;
      })
    );

    this.dispatchFilter({
      sortOrder: <SortOrderOptionsEnum>defaultSortOrder,
      dateFrom: defaultFromDate,
      dateTo: defaultToDate,
    });
  }

  override resetFilter() {
    this.store.dispatch(
      TopSellingProductActions.resetTopSellingProductState()
    );
  }

  override dispatchFilter(data: {
    dateFrom: string;
    dateTo: string;
    sortOrder: SortOrderOptionsEnum;
  }) {
    this.store.dispatch(
      TopSellingProductActions.setSortAndfilterTopSellingProductsDatesAction({
        dateStart: data.dateFrom,
        dateEnd: data.dateTo,
        sortOrder: data.sortOrder,
      })
    );
  }
}
