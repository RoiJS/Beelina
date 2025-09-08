import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { AppStateInterface } from '../_interfaces/app-state.interface';

import * as UserAccountActions from '../accounts/store/actions';
import { filterKeywordSelector, isLoadingSelector, totalCountSelector } from './store/selectors';

import { ButtonOptions } from '../_enum/button-options.enum';
import { ClientSubscriptionDetails } from '../_models/client-subscription-details.model';
import { UserAccountDataSource } from '../_models/datasources/user-account.datasource';
import { User } from '../_models/user.model';

import { ApplySubscriptionService } from '../_services/apply-subscription.service';
import { AuthService } from '../_services/auth.service';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { DialogService } from '../shared/ui/dialog/dialog.service';
import { LocalClientSubscriptionDbService } from '../_services/local-db/local-client-subscription-db.service';
import { UserAccountService } from '../_services/user-account.service';
import { NotificationService } from '../shared/ui/notification/notification.service';

import { SalesAgentTypeEnum } from '../_enum/sales-agent-type.enum';
import { BusinessModelEnum } from '../_enum/business-model.enum';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
  private _dataSource: UserAccountDataSource;
  private _filterKeyword = signal<string>('');
  private _totalUserAccountCount = signal<number>(0);
  private _subscription: Subscription = new Subscription();

  clientSubscriptionDetails: ClientSubscriptionDetails;
  BusinessModelEnum = BusinessModelEnum;
  SalesAgentTypeEnum = SalesAgentTypeEnum;

  authService = inject(AuthService);
  applySubscriptionService = inject(ApplySubscriptionService);
  bottomSheet = inject(MatBottomSheet);
  dialogService = inject(DialogService);
  localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService);
  notificationService = inject(NotificationService);
  store = inject(Store<AppStateInterface>);
  router = inject(Router);
  translateService = inject(TranslateService);
  userAccountService = inject(UserAccountService);

  constructor() {
    super();
    this.store.dispatch(UserAccountActions.resetUserAccountsState());
    this.$isLoading = this.store.pipe(select(isLoadingSelector));
    this._dataSource = new UserAccountDataSource(this.store);
    this.applySubscriptionService.setBottomSheet(this.bottomSheet);
  }

  async ngOnInit() {
    this.store.dispatch(UserAccountActions.getUserAccountsAction());
    this.clientSubscriptionDetails = await this.localClientSubscriptionDbService.getLocalClientSubsription();
  }

  ngAfterViewInit() {
    this._subscription.add(
      this.store.pipe(select(filterKeywordSelector))
        .subscribe((filterKeyword: string) => {
          this._filterKeyword.set(filterKeyword);
        })
    );

    this._subscription.add(
      this.store.pipe(select(totalCountSelector))
        .subscribe((totalCount: number) => {
          this._totalUserAccountCount.set(totalCount);
        })
    );
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
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
    if (this.clientSubscriptionDetails.userAccountsMax === 0 && this._totalUserAccountCount() >= this.clientSubscriptionDetails.userAccountsMax) {
      if (!this.clientSubscriptionDetails.allowExceedUserAccountsMax) {
        this.applySubscriptionService.open(this.translateService.instant("SUBSCRIPTION_TEXTS.USER_REGISTRATION_EXCEEDS_LIMIT_ERROR", { userAccountsMax: this.clientSubscriptionDetails.userAccountsMax }));
        return;
      }
    }

    this.router.navigate(['/app/accounts/manage-user-account-details']);
  }

  editUserAccount(user: User) {
    this.router.navigate([`/app/accounts/manage-user-account-details/${user.id}`]);
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

    this.dialogService
      .openConfirmation(title, message)
      .subscribe((result: ButtonOptions) => {
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
    return this._filterKeyword();
  }

  get totalUserAccounts(): number {
    return this._totalUserAccountCount();
  }

  get dataSource(): UserAccountDataSource {
    return this._dataSource;
  }
}
