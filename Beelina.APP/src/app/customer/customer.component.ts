import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import * as CustomerStoreActions from '../customer/store/actions';
import { customerStoresSelector, isLoadingSelector } from './store/selectors';
import {
  CustomerStore,
  CustomerStoreService,
} from '../_services/customer-store.service';
import { DialogService } from '../shared/ui/dialog/dialog.service';
import { ButtonOptions } from '../_enum/button-options.enum';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
})
export class CustomerComponent implements OnInit, OnDestroy {
  private _dataSource: CustomerStoreDataSource;
  private _searchForm: FormGroup;

  $isLoading: Observable<boolean>;

  constructor(
    private customerStoreService: CustomerStoreService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
    private store: Store<AppStateInterface>,
    private snackBarService: MatSnackBar,
    private translateService: TranslateService
  ) {
    this._dataSource = new CustomerStoreDataSource(this.store);

    this._searchForm = this.formBuilder.group({
      filterKeyword: [''],
    });

    this.$isLoading = this.store.pipe(select(isLoadingSelector));
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.store.dispatch(CustomerStoreActions.resetCustomerState());
  }

  openDetails(id: number) {
    this.router.navigate([`customers/edit-customer/${id}`]);
  }

  deleteStore(storeId: number) {
    this.dialogService
      .openConfirmation(
        this.translateService.instant(
          'CUSTOMERS_PAGE.DELETE_CUSTOMER_DIALOG.TITLE'
        ),
        this.translateService.instant(
          'CUSTOMERS_PAGE.DELETE_CUSTOMER_DIALOG.CONFIRM'
        )
      )
      .subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this.customerStoreService.deleteCustomer(storeId).subscribe({
            next: () => {
              this.snackBarService.open(
                this.translateService.instant(
                  'CUSTOMERS_PAGE.DELETE_CUSTOMER_DIALOG.SUCCESS_MESSAGE'
                ),
                this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                {
                  duration: 5000,
                }
              );
              this.store.dispatch(CustomerStoreActions.resetCustomerState());
              this.store.dispatch(
                CustomerStoreActions.getCustomerStoreAction()
              );
            },

            error: () => {
              this.snackBarService.open(
                this.translateService.instant(
                  'CUSTOMERS_PAGE.DELETE_CUSTOMER_DIALOG.ERROR_MESSAGE'
                ),
                this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                {
                  duration: 5000,
                }
              );
            },
          });
        }
      });
  }

  addCustomer() {
    this.router.navigate(['customers/add-customer']);
  }

  onSearch() {
    const filterKeyword = this._searchForm.get('filterKeyword').value;
    this.store.dispatch(CustomerStoreActions.resetCustomerState());
    this.store.dispatch(
      CustomerStoreActions.setSearchCustomersAction({ keyword: filterKeyword })
    );
    this.store.dispatch(CustomerStoreActions.getCustomerStoreAction());
  }

  get dataSource(): CustomerStoreDataSource {
    return this._dataSource;
  }

  get searchForm(): FormGroup {
    return this._searchForm;
  }
}

export class BaseDataSource<T> extends DataSource<T | undefined> {
  protected _pageSize = 100;
  protected _fetchedPages = new Set<number>();
  protected readonly _dataStream = new BehaviorSubject<(T | undefined)[]>([]);
  protected readonly _subscription = new Subscription();

  constructor(protected store: Store<AppStateInterface>) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<(T | undefined)[]> {
    this._subscription.add(
      collectionViewer.viewChange.subscribe((range) => {
        const startPage = this._getPageForIndex(range.start);
        const endPage = this._getPageForIndex(range.end);

        for (let i = startPage; i <= endPage; i++) {
          this._fetchPage(i);
        }
      })
    );
    return this._dataStream;
  }

  disconnect(): void {
    this._subscription.unsubscribe();
  }

  private _getPageForIndex(index: number): number {
    return Math.floor(index / this._pageSize);
  }

  private _fetchPage(page: number) {
    if (this._fetchedPages.has(page)) {
      return;
    }

    this._fetchedPages.add(page);
    this.fetchData();
  }

  protected fetchData() {
    throw new Error('Not implemented!');
  }
}

export class CustomerStoreDataSource extends BaseDataSource<CustomerStore> {
  constructor(override store: Store<AppStateInterface>) {
    super(store);

    this.store.dispatch(CustomerStoreActions.getCustomerStoreAction());

    this._subscription.add(
      this.store
        .pipe(select(customerStoresSelector))
        .subscribe((customerStores: Array<CustomerStore>) => {
          this._dataStream.next(customerStores);
        })
    );
  }

  override fetchData() {
    this.store.dispatch(CustomerStoreActions.getCustomerStoreAction());
  }
}
