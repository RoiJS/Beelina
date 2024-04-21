import { createAction, props } from '@ngrx/store';

import { User } from 'src/app/_models/user.model';

export const getUserAccountsAction = createAction(
  '[User Accounts] Get User Accounts'
);

export const getUserAccountsActionSuccess = createAction(
  '[User Accounts] Get User Accounts Success',
  props<{
    endCursor: string;
    hasNextPage: boolean;
    userAccounts: Array<User>;
    totalCount: number,
  }>()
);

export const getUserAccountsActionError = createAction(
  '[User Accounts] Get User Accounts Error',
  props<{ error: string }>()
);

export const resetUserAccountsState = createAction(
  '[User Accounts] Reset User Accounts',
);

export const setSearchUserAccountsAction = createAction(
  '[User Accounts] Search User Accounts',
  props<{ keyword: string }>()
);
