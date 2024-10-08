import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import { BarangaysDataSource } from '../_models/datasources/barangays.datasource';
import { isLoadingSelector } from '../barangays/store/selectors';
import { BaseComponent } from '../shared/components/base-component/base.component';

import { BarangayService } from '../_services/barangay.service';
import { DialogService } from '../shared/ui/dialog/dialog.service';
import { LocalCustomerAccountsDbService } from '../_services/local-db/local-customer-accounts-db.service';
import { NotificationService } from '../shared/ui/notification/notification.service';

import { Barangay } from '../_models/barangay';
import * as BarangaysStoreActions from '../barangays/store/actions';
import { ManageBarangayComponent } from './manage-barangay/manage-barangay.component';

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

  constructor(
    private barangayService: BarangayService,
    private bottomSheet: MatBottomSheet,
    private dialogService: DialogService,
    private localCustomerAccountsDbService: LocalCustomerAccountsDbService,
    private notificationService: NotificationService,
    private router: Router,
    private store: Store<AppStateInterface>,
    private translateService: TranslateService
  ) {
    super();
    this._dataSource = new BarangaysDataSource(this.store);
    this.$isLoading = this.store.pipe(select(isLoadingSelector));
  }

  ngOnInit() { }

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
    this.openBarangayDialog(new Barangay());
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
