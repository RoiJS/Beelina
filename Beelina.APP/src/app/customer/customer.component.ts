import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

import { AppStateInterface } from '../_interfaces/app-state.interface';

import * as CustomerStoreActions from '../customer/store/actions';
import * as BarangaysActions from '../barangays/store/actions';
import { isLoadingSelector } from './store/selectors';

import { CustomerStoreService } from '../_services/customer-store.service';
import { DialogService } from '../shared/ui/dialog/dialog.service';

import { ButtonOptions } from '../_enum/button-options.enum';

import { CustomerStoreDataSource } from '../_models/datasources/customer-store.datasource';

import { BaseComponent } from '../shared/components/base-component/base.component';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
})
export class CustomerComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  private _dataSource: CustomerStoreDataSource;
  private _barangay: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private customerStoreService: CustomerStoreService,
    private dialogService: DialogService,
    private router: Router,
    private store: Store<AppStateInterface>,
    private snackBarService: MatSnackBar,
    private translateService: TranslateService
  ) {
    super();
    this._barangay = this.activatedRoute.snapshot.paramMap.get('barangay');
    this._dataSource = new CustomerStoreDataSource(this.store, this._barangay);

    this.$isLoading = this.store.pipe(select(isLoadingSelector));
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.store.dispatch(CustomerStoreActions.resetCustomerState());
    this.store.dispatch(BarangaysActions.resetBarangayState());
  }

  openDetails(id: number) {
    this.router.navigate([`barangays/${this._barangay}/${id}`]);
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
    this.router.navigate([`/barangays/${this._barangay}/add-customer`]);
  }

  onSearch(filterKeyword: string) {
    this.store.dispatch(CustomerStoreActions.resetCustomerState());
    this.store.dispatch(
      CustomerStoreActions.setSearchCustomersAction({ keyword: filterKeyword })
    );
    this.store.dispatch(
      CustomerStoreActions.getCustomerStorePerBarangayAction({
        barangayName: this._barangay,
      })
    );
  }

  onGoBack() {
    this.router.navigate([`/barangays`]);
  }

  get dataSource(): CustomerStoreDataSource {
    return this._dataSource;
  }

  get barangay(): string {
    return this._barangay;
  }
}
