import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { AppStateInterface } from '../_interfaces/app-state.interface';

import * as CustomerStoreActions from '../customer/store/actions';
import * as BarangaysActions from '../barangays/store/actions';
import { isLoadingSelector } from './store/selectors';

import { ApplySubscriptionService } from '../_services/apply-subscription.service';
import { CustomerStoreService } from '../_services/customer-store.service';
import { DialogService } from '../shared/ui/dialog/dialog.service';
import { LocalClientSubscriptionDbService } from '../_services/local-db/local-client-subscription-db.service';
import { LocalCustomerStoresDbService } from '../_services/local-db/local-customer-stores-db.service';
import { NotificationService } from '../shared/ui/notification/notification.service';

import { ButtonOptions } from '../_enum/button-options.enum';
import { CustomerStoreDataSource } from '../_models/datasources/customer-store.datasource';

import { BaseComponent } from '../shared/components/base-component/base.component';
import { ClientSubscriptionDetails } from '../_models/client-subscription-details.model';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
})
export class CustomerComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  private _dataSource: CustomerStoreDataSource;
  private _barangay: string;

  activatedRoute = inject(ActivatedRoute);
  applySubscriptionService = inject(ApplySubscriptionService);
  bottomSheet = inject(MatBottomSheet);
  clientSubscriptionDetails: ClientSubscriptionDetails;
  customerStoreService = inject(CustomerStoreService);
  dialogService = inject(DialogService);
  localCustomerStoresDbService = inject(LocalCustomerStoresDbService);
  localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  store = inject(Store<AppStateInterface>);
  translateService = inject(TranslateService);

  constructor() {
    super();
    this._barangay = this.activatedRoute.snapshot.paramMap.get('barangay');
    this._dataSource = new CustomerStoreDataSource(this.store, this._barangay);

    this.$isLoading = this.store.pipe(select(isLoadingSelector));
    this.applySubscriptionService.setBottomSheet(this.bottomSheet);
  }

  async ngOnInit() {
    this.clientSubscriptionDetails = await this.localClientSubscriptionDbService.getLocalClientSubsription();
  }

  ngOnDestroy() {
    this.store.dispatch(CustomerStoreActions.resetCustomerState());
    this.store.dispatch(BarangaysActions.resetBarangayState());
  }

  openDetails(id: number) {
    this.router.navigate([`customer-accounts/${this._barangay}/${id}`]);
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
              this.localCustomerStoresDbService.deleteLocalCustomerStore(storeId);
              this.notificationService.openSuccessNotification(this.translateService.instant(
                'CUSTOMERS_PAGE.DELETE_CUSTOMER_DIALOG.SUCCESS_MESSAGE'
              ));
              this.store.dispatch(CustomerStoreActions.resetCustomerState());
              this.store.dispatch(
                CustomerStoreActions.getCustomerStorePerBarangayAction({ barangayName: this._barangay })
              );
            },
            error: () => {
              this.notificationService.openErrorNotification(this.translateService.instant(
                'CUSTOMERS_PAGE.DELETE_CUSTOMER_DIALOG.ERROR_MESSAGE'
              ));
            },
          });
        }
      });
  }

  addCustomer() {
    if (this._dataSource.data.length <= this.clientSubscriptionDetails.customersMax) {
      this.router.navigate([`/customer-accounts/${this._barangay}/add-customer`]);
    } else {
      this.applySubscriptionService.open(this.translateService.instant("SUBSCRIPTION_TEXTS.CUSTOMER_LIMIT_ERROR", {customersMax: this.clientSubscriptionDetails.customersMax}));
    }
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

  onClear() {
    this.onSearch('');
  }

  onGoBack() {
    this.router.navigate([`/customer-accounts`]);
  }

  get dataSource(): CustomerStoreDataSource {
    return this._dataSource;
  }

  get barangay(): string {
    return this._barangay;
  }
}
