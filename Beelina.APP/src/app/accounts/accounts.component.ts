import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AppStateInterface } from '../_interfaces/app-state.interface';

import * as UserAccountActions from '../accounts/store/actions';
import { filterKeywordSelector, isLoadingSelector, totalCountSelector } from './store/selectors';

import { UserAccountDataSource } from '../_models/datasources/user-account.datasource';
import { User } from '../_models/user.model';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { DialogService } from '../shared/ui/dialog/dialog.service';
import { NotificationService } from '../shared/ui/notification/notification.service';
import { ButtonOptions } from '../_enum/button-options.enum';
import { UserAccountService } from '../_services/user-account.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent extends BaseComponent implements OnInit {
  private _dataSource: UserAccountDataSource;
  private _filterKeyword: string;
  private _totalUserAccountCount: number;
  private _subscription: Subscription = new Subscription();

  constructor(
    private userAccountService: UserAccountService,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private router: Router,
    private store: Store<AppStateInterface>,
    private translateService: TranslateService
  ) {
    super();
    this.store.dispatch(UserAccountActions.resetUserAccountsState());
    this.$isLoading = this.store.pipe(select(isLoadingSelector));
    this._dataSource = new UserAccountDataSource(this.store);
  }

  ngOnInit() {
    this.store.dispatch(UserAccountActions.getUserAccountsAction());
  }

  ngAfterViewInit() {
    this._subscription.add(
      this.store.pipe(select(filterKeywordSelector))
        .subscribe((filterKeyword: string) => {
          this._filterKeyword = filterKeyword;
        })
    );

    this._subscription.add(
      this.store.pipe(select(totalCountSelector))
        .subscribe((totalCount: number) => {
          this._totalUserAccountCount = totalCount;
        })
    );
  }

  onSearch(filterKeyword: string) {
    this.store.dispatch(UserAccountActions.resetUserAccountsState());
    this.store.dispatch(
      UserAccountActions.setSearchUserAccountsAction({ keyword: filterKeyword })
    );
    this.store.dispatch(UserAccountActions.getUserAccountsAction());
  }

  onClear() {
    this.onSearch('');
  }

  addUserAccount() {
    this.router.navigate(['/accounts/manage-user-account-details']);
  }

  editUserAccount(user: User) {
    this.router.navigate([`/accounts/manage-user-account-details/${user.id}`]);
  }

  deleteUser(user: User) {
    this.dialogService.openConfirmation(
      this.translateService.instant('ACCOUNTS_PAGE.DELETE_ACCOUNT_DIALOG.TITLE'),
      this.translateService.instant('ACCOUNTS_PAGE.DELETE_ACCOUNT_DIALOG.CONFIRM'),
    ).subscribe((result: ButtonOptions) => {
      if (result === ButtonOptions.YES) {
        this.userAccountService
          .deleteUserAccounts([user.id])
          .subscribe({
            next: () => {
              this.notificationService.openSuccessNotification(this.translateService.instant(
                'ACCOUNTS_PAGE.DELETE_ACCOUNT_DIALOG.SUCCESS_MESSAGE'
              ));
              this.store.dispatch(UserAccountActions.resetUserAccountsState());
              this.store.dispatch(UserAccountActions.getUserAccountsAction());
            },
            error: () => {
              this.notificationService.openErrorNotification(this.translateService.instant(
                'ACCOUNTS_PAGE.DELETE_ACCOUNT_DIALOG.ERROR_MESSAGE'
              ));
              this.store.dispatch(UserAccountActions.resetUserAccountsState());
            }
          });
      }
    });
  }

  activateUser(user: User, status: boolean) {
    let title = "", message = "", successMessage = "", errorMessage = "";

    if (status) {
      title = this.translateService.instant('ACCOUNTS_PAGE.ACTIVATE_ACCOUNT_DIALOG.TITLE');
      message = this.translateService.instant('ACCOUNTS_PAGE.ACTIVATE_ACCOUNT_DIALOG.CONFIRM');
      successMessage = this.translateService.instant('ACCOUNTS_PAGE.ACTIVATE_ACCOUNT_DIALOG.SUCCESS_MESSAGE');
      errorMessage = this.translateService.instant('ACCOUNTS_PAGE.ACTIVATE_ACCOUNT_DIALOG.ERROR_MESSAGE');
    } else {
      title = this.translateService.instant('ACCOUNTS_PAGE.DEACTIVATE_ACCOUNT_DIALOG.TITLE');
      message = this.translateService.instant('ACCOUNTS_PAGE.DEACTIVATE_ACCOUNT_DIALOG.CONFIRM');
      successMessage = this.translateService.instant('ACCOUNTS_PAGE.DEACTIVATE_ACCOUNT_DIALOG.SUCCESS_MESSAGE');
      errorMessage = this.translateService.instant('ACCOUNTS_PAGE.DEACTIVATE_ACCOUNT_DIALOG.ERROR_MESSAGE');
    }

    this.dialogService.openConfirmation(title, message).subscribe((result: ButtonOptions) => {
      if (result === ButtonOptions.YES) {
        this.userAccountService
          .setUserAccountsStatus([user.id], status)
          .subscribe({
            next: () => {
              this.notificationService.openSuccessNotification(successMessage);
              this.store.dispatch(UserAccountActions.resetUserAccountsState());
              this.store.dispatch(UserAccountActions.getUserAccountsAction());
            },
            error: () => {
              this.notificationService.openErrorNotification(errorMessage);
              this.store.dispatch(UserAccountActions.resetUserAccountsState());
            }
          });
      }
    });
  }

  get filterKeyword(): string {
    return this._filterKeyword;
  }

  get totalUserAccounts(): number {
    return this._totalUserAccountCount;
  }

  get dataSource(): UserAccountDataSource {
    return this._dataSource;
  }
}
