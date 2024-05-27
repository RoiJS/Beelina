import { Store, select } from '@ngrx/store';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import * as UserAccountActions from '../../accounts/store/actions';

import { BaseDataSource } from './base.datasource';
import { userAccountsSelector } from 'src/app/accounts/store/selectors';
import { User } from '../user.model';

export class UserAccountDataSource extends BaseDataSource<User> {
  constructor(protected store: Store<AppStateInterface>) {
    super();
    this._pageSize = 50;
    this.store.dispatch(UserAccountActions.getUserAccountsAction());

    this._subscription.add(
      this.store
        .pipe(select(userAccountsSelector))
        .subscribe((userAccounts: Array<User>) => {
          this._dataStream.next(userAccounts);
        })
    );
  }

  override fetchData() {
    this.store.dispatch(UserAccountActions.getUserAccountsAction());
  }
}
