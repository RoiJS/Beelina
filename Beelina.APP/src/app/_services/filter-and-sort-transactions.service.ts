import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { StorageService } from './storage.service';

import {
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { Store } from '@ngrx/store';

import { SortOrderOptionsEnum } from '../_enum/sort-order-options.enum';
import { AppStateInterface } from '../_interfaces/app-state.interface';

import * as TransactionDateStoreActions from '../transaction-history/store/actions';
import * as TransactionHistoryStoreActions from '../transaction-history/store/actions';
import {
  fromDateSelector,
  sortOrderSelector,
  toDateSelector,
} from '../transaction-history/store/selectors';

import { TransactionDatesDataSource } from '../_models/datasources/transaction-dates.datasource';
import { FilterAndSortComponent } from '../shared/ui/filter-and-sort/filter-and-sort.component';

@Injectable({
  providedIn: 'root',
})
export class FilterAndSortTransactionsService {
  private dateFromProp: string;
  private dateToProp: string;
  private sortOrderProp: string;

  private _fromDate: string;
  private _toDate: string;
  private _sortOrder: SortOrderOptionsEnum;
  private _dataSource: TransactionDatesDataSource;

  private subscription: Subscription = new Subscription();

  private _dialogRef: MatBottomSheetRef<
    FilterAndSortComponent,
    { dateFrom: string; dateTo: string; sortOrder: SortOrderOptionsEnum }
  >;

  private _bottomSheet: MatBottomSheet;

  constructor(
    private storageService: StorageService,
    private store: Store<AppStateInterface>
  ) {}

  setProps(dateFromProp: string, dateToProp: string, sortOrderProp: string) {
    this.dateFromProp = dateFromProp;
    this.dateToProp = dateToProp;
    this.sortOrderProp = sortOrderProp;

    this.subscription = new Subscription();

    const defaultSortOrder =
      this.storageService.getString(this.sortOrderProp) ||
      SortOrderOptionsEnum.ASCENDING;
    const defaultFromDate = this.storageService.getString(this.dateFromProp);
    const defaultToDate = this.storageService.getString(this.dateToProp);

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

    this.subscription.add(
      this.store.dispatch(
        TransactionHistoryStoreActions.setSortAndfilterTransactionDatesAction({
          sortOrder: <SortOrderOptionsEnum>defaultSortOrder,
          dateStart: defaultFromDate === 'null' ? null : defaultFromDate,
          dateEnd: defaultToDate === 'null' ? null : defaultToDate,
        })
      )
    );

    return this;
  }

  setBottomSheet(bottomSheet: MatBottomSheet) {
    this._bottomSheet = bottomSheet;
    return this;
  }

  setDataSource(dataSource: TransactionDatesDataSource) {
    this._dataSource = dataSource;
    return this;
  }

  openFilter() {
    this._dialogRef = this._bottomSheet.open(FilterAndSortComponent, {
      data: {
        fromDate: this._fromDate,
        toDate: this._toDate,
        sortOrder: this._sortOrder,
      },
    });

    this._dialogRef
      .afterDismissed()
      .subscribe(
        (data: {
          dateFrom: string;
          dateTo: string;
          sortOrder: SortOrderOptionsEnum;
        }) => {
          this.store.dispatch(
            TransactionDateStoreActions.setSortAndfilterTransactionDatesAction({
              dateStart: data.dateFrom,
              dateEnd: data.dateTo,
              sortOrder: data.sortOrder,
            })
          );

          this.storageService.storeString(this.dateFromProp, data.dateFrom);
          this.storageService.storeString(this.dateToProp, data.dateTo);
          this.storageService.storeString(this.sortOrderProp, data.sortOrder);

          this.store.dispatch(
            TransactionDateStoreActions.resetTransactionDatesListState()
          );

          this._dataSource.fetchData();
        }
      );
  }

  destroy() {
    this.subscription.unsubscribe();
    this._dialogRef = null;
  }

  get dataSource(): TransactionDatesDataSource {
    return this._dataSource;
  }

  get isFilterActive(): boolean {
    return (
      this._fromDate !== null ||
      this._toDate !== null ||
      this._sortOrder !== SortOrderOptionsEnum.ASCENDING
    );
  }
}
