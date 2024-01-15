import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { BaseFilterAndSortService } from './base-filter-and-sort.service';
import { ProductStockAuditItem } from '../_models/product-stock-audit-item';
import { StorageService } from './storage.service';
import { AppStateInterface } from '../_interfaces/app-state.interface';

import { fromDateSelector, sortOrderSelector, toDateSelector } from '../product/edit-product-details/manage-product-stock-audit/store/selectors';
import * as ProductStockAuditsStoreActions from '../product/edit-product-details/manage-product-stock-audit/store/actions';

import { SortOrderOptionsEnum } from '../_enum/sort-order-options.enum';

@Injectable({
  providedIn: 'root'
})
export class StockAuditFilterService extends BaseFilterAndSortService<ProductStockAuditItem> {

  constructor(protected override storageService: StorageService,
    protected override store: Store<AppStateInterface>) {
    super(storageService, store);


  }

  override setPropsSubscriptions(defaultSortOrder: string, defaultFromDate: string, defaultToDate: string) {
    this.subscription = new Subscription();

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
      ProductStockAuditsStoreActions.resetProductStockAuditItemsState()
    );
  }

  override dispatchFilter(data: {
    dateFrom: string;
    dateTo: string;
    sortOrder: SortOrderOptionsEnum;
  }) {
    this.store.dispatch(
      ProductStockAuditsStoreActions.setSortAndfilterStockAuditsAction({
        dateStart: data.dateFrom,
        dateEnd: data.dateTo,
        sortOrder: data.sortOrder,
      })
    );
  }
}
