import { createReducer, on } from '@ngrx/store';

import * as UserAccountActions from './actions';
import { IUserAccountState } from './user-account.interface';
import { User } from 'src/app/_models/user.model';

export const initialState: IUserAccountState = {
  isLoading: false,
  isUpdateLoading: false,
  userAccounts: new Array<User>(),
  endCursor: null,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
  totalCount: 0,
};

export const reducers = createReducer(
  initialState,
  on(
    UserAccountActions.getUserAccountsAction,
    (state, action) =>
      <IUserAccountState>{
        ...state,
        isLoading: true,
      }
  ),
  on(
    UserAccountActions.getUserAccountsActionSuccess,
    (state, action) =>
      <IUserAccountState>{
        ...state,
        isLoading: false,
        endCursor: action.endCursor,
        totalCount: action.totalCount,
        userAccounts: state.userAccounts.concat(action.userAccounts),
      }
  ),
  on(
    UserAccountActions.getUserAccountsActionError,
    (state, action) =>
      <IUserAccountState>{
        ...state,
        error: action.error,
      }
  ),
  on(UserAccountActions.resetUserAccountsState, (state, action) => ({
    ...initialState,
  })),
  on(UserAccountActions.setSearchUserAccountsAction, (state, action) => ({
    ...state,
    filterKeyword: action.keyword,
  })),
);
