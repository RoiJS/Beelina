import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import { BarangaysDataSource } from '../_models/datasources/barangays.datasource';
import { isLoadingSelector } from '../barangays/store/selectors';
import { BaseComponent } from '../shared/components/base-component/base.component';

import { ApplySubscriptionService } from '../_services/apply-subscription.service';
import { BarangayService } from '../_services/barangay.service';
import { DialogService } from '../shared/ui/dialog/dialog.service';
import { LocalCustomerAccountsDbService } from '../_services/local-db/local-customer-accounts-db.service';
import { LocalClientSubscriptionDbService } from '../_services/local-db/local-client-subscription-db.service';
import { NotificationService } from '../shared/ui/notification/notification.service';

import { Barangay } from '../_models/barangay';
import * as BarangaysStoreActions from '../barangays/store/actions';
import { ManageBarangayComponent } from './manage-barangay/manage-barangay.component';
import { ClientSubscriptionDetails } from '../_models/client-subscription-details.model';

@Component({
  selector: 'app-barangays',
  templateUrl: './barangays.component.html',
  styleUrls: ['./barangays.component.scss'],
})
export class BarangaysComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  private _dataSource: BarangaysDataSource;
  private _manageBarangayDialogRef: any;

  clientSubscriptionDetails: ClientSubscriptionDetails;

  applySubscriptionService = inject(ApplySubscriptionService);
  barangayService = inject(BarangayService);
  bottomSheet = inject(MatBottomSheet);
  dialogService = inject(DialogService);
  localCustomerAccountsDbService = inject(LocalCustomerAccountsDbService);
  localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  store = inject(Store<AppStateInterface>);
  translateService = inject(TranslateService);

  constructor() {
    super();
    this.applySubscriptionService.setBottomSheet(this.bottomSheet);
    this._dataSource = new BarangaysDataSource(this.store);
    this.$isLoading = this.store.pipe(select(isLoadingSelector));
  }

  async ngOnInit() {
    this.clientSubscriptionDetails = await this.localClientSubscriptionDbService.getLocalClientSubsription();
  }

  ngOnDestroy() {
    this.store.dispatch(BarangaysStoreActions.resetBarangayState());
  }

  onSearch(filterKeyword: string) {
    this.store.dispatch(BarangaysStoreActions.resetBarangayState());
    this.store.dispatch(
      BarangaysStoreActions.setSearchBarangaysAction({ keyword: filterKeyword })
    );
    this.store.dispatch(BarangaysStoreActions.getBarangaysAction());
  }

  onClear() {
    this.onSearch('');
  }

  addBarangay() {
    if (this._dataSource.data.length <= this.clientSubscriptionDetails.customerAccountsMax) {
      this.openBarangayDialog(new Barangay());
    } else {
      this.applySubscriptionService.open(this.translateService.instant("SUBSCRIPTION_TEXTS.CUSTOMER_ACCOUNTS_LIMIT_ERROR", {customerAccountsMax: this.clientSubscriptionDetails.customerAccountsMax}));
    }
  }

  updateBarangay(barangay: Barangay) {
    this.openBarangayDialog(barangay);
  }

  private openBarangayDialog(barangay: Barangay) {
    if (this._manageBarangayDialogRef) this._manageBarangayDialogRef = null;

    this._manageBarangayDialogRef = this.bottomSheet.open(
      ManageBarangayComponent,
      {
        data: { barangay },
      }
    );

    this._manageBarangayDialogRef
      .afterDismissed()
      .subscribe((data: boolean) => {
        if (data) {
          this.store.dispatch(BarangaysStoreActions.resetBarangayList());
          this.store.dispatch(BarangaysStoreActions.getBarangaysAction());
        }
      });
  }

  deleteBarangay(id: number) {
    this.dialogService
      .openConfirmation(
        this.translateService.instant(
          'CUSTOMER_ACCOUNTS_PAGE.DELETE_CUSTOMER_ACCOUNT_DIALOG.TITLE'
        ),
        this.translateService.instant(
          'CUSTOMER_ACCOUNTS_PAGE.DELETE_CUSTOMER_ACCOUNT_DIALOG.CONFIRM'
        )
      )
      .subscribe((result) => {
        if (result) {
          this.barangayService.deleteBarangay(id).subscribe({
            complete: () => {
              this.notificationService.openSuccessNotification(this.translateService.instant(
                'CUSTOMER_ACCOUNTS_PAGE.DELETE_CUSTOMER_ACCOUNT_DIALOG.SUCCESS_MESSAGE'
              ));
              this.localCustomerAccountsDbService.deleteLocalCustomreAccount(id);
              this.store.dispatch(BarangaysStoreActions.resetBarangayList());
              this.store.dispatch(BarangaysStoreActions.getBarangaysAction());
            },
            error: (err) => {
              this.notificationService.openErrorNotification(this.translateService.instant(
                'CUSTOMER_ACCOUNTS_PAGE.DELETE_CUSTOMER_ACCOUNT_DIALOG.ERROR_MESSAGE'
              ));
            },
          });
        }
      });
  }

  goToCustomers(barangay: string) {
    this.router.navigate([`customer-accounts/${barangay}`]);
  }

  get dataSource(): BarangaysDataSource {
    return this._dataSource;
  }
}
