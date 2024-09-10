import { inject, Injectable, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Apollo, gql, MutationResult } from 'apollo-angular';
import { TranslateService } from '@ngx-translate/core';

import { ApolloQueryResult } from '@apollo/client/core';
import { catchError, map, take } from 'rxjs/operators';


import { AppStateInterface } from '../_interfaces/app-state.interface';
import { User } from '../_models/user.model';

import { GenderEnum } from '../_enum/gender.enum';

import { IUserAccountInput } from '../_interfaces/inputs/iuser-account.input';
import { ILoginInput } from '../_interfaces/inputs/ilogin.input';
import { IUserPermissionInput } from '../_interfaces/inputs/iuser-permission.input';
import { IUpdateAccountOutput } from '../_interfaces/outputs/iupdate-account.output';
import { IUserAccountInformationQueryPayload } from '../_interfaces/payloads/iuser-account-information-query.payload';
import { UserAccountNotExistsError } from '../_models/errors/user-account-not-exists.error';
import { CheckUsernameInformationResult } from '../_models/results/check-usernamee-information-result';
import { UserAccountInformationResult } from '../_models/results/user-account-information-result';
import { UserModulePermission } from '../_models/user-module-permission';
import { IBaseConnection } from '../_interfaces/connections/ibase.connection';
import { endCursorSelector, filterKeywordSelector } from '../accounts/store/selectors';
import { ModuleEnum } from '../_enum/module.enum';
import { UserSetting } from '../_models/user-setting';
import { LocalUserSettingsDbService } from './local-db/local-user-settings-db.service';

const UPDATE_USER_CREDENTIALS = gql`
  mutation ($userAccountInput: UserAccountInput!) {
    updateUserAccount(
      input: { userAccountInput: $userAccountInput }
    ) {
      userAccount {
        id
        username
      }
      errors {
        __typename
        ... on UserAccountNotExistsError {
          message
        }
        ... on BaseError {
          message
        }
      }
    }
  }
`;

const VERIFY_USER_ACCOUNT = gql`
  query ($loginInput: LoginInput!) {
    verifyUserAccount(loginInput: $loginInput) {
      typename: __typename
      ... on UserAccountInformationResult {
        id
        firstName
        middleName
        lastName
        gender
        emailAddress
        username
        userPermissions {
          id
          moduleId
          permissionLevel
        }
      }

      ... on UserAccountNotExistsError {
        message
      }
    }
  }
`;

const CHECK_USERNAME = gql`
  query ($userId: Int!, $username: String!) {
    checkUsername(userId: $userId, username: $username) {
      typename: __typename
      ... on CheckUsernameInformationResult {
        exists
      }
    }
  }
`;

const GET_USER_ACCOUNTS_QUERY = gql`
  query ($cursor: String, $filterKeyword: String) {
    userAccounts(
      after: $cursor
      filterKeyword: $filterKeyword
    ) {
        nodes {
          id
          firstName
          middleName
          lastName
          gender
          emailAddress
          username
          isActive
          userPermissions {
              id
              moduleId
              permissionLevel
          }
        }
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
        totalCount
    }
  }
`;

const GET_USER_ACCOUNT_QUERY = gql`
query ($userId: Int!) {
  userAccount(userId: $userId) {
    typename: __typename
    ... on UserAccountInformationResult {
      id
      firstName
      middleName
      lastName
      gender
      emailAddress
      username
      userPermissions {
        id
        moduleId
        permissionLevel
      }
    }

    ... on UserAccountNotExistsError {
      message
    }
  }
}
`;

const GET_USER_SETTINGS_QUERY = gql`
  query($userId: Int!) {
    userSetting(userId: $userId) {
      allowOrderConfirmation
      allowOrderPayments
      allowSendReceipt
      allowAutoSendReceipt
    }
  }
`;

const DELETE_USER_ACCOUNTS_QUERY = gql`
  mutation($userIds: [Int!]!) {
    deleteUserAccounts(input: { userIds: $userIds }) {
      boolean
    }
  }
`;

const SET_USER_ACCOUNTS_STATUS_QUERY = gql`
  mutation($userIds: [Int!]!, $state: Boolean!) {
    setUserAccountsStatus(input: { userIds: $userIds, state: $state }) {
      boolean
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class UserAccountService {
  apollo = inject(Apollo);
  localUserSettingsDbService = inject(LocalUserSettingsDbService);
  store = inject(Store<AppStateInterface>);
  translateService = inject(TranslateService);

  userSetting = signal<UserSetting>(new UserSetting());

  getUserAccounts() {
    let cursor = null,
      filterKeyword = '';

    this.store
      .select(endCursorSelector)
      .pipe(take(1))
      .subscribe((currentCursor) => (cursor = currentCursor));

    this.store
      .select(filterKeywordSelector)
      .pipe(take(1))
      .subscribe(
        (currentFilterKeyword) => (filterKeyword = currentFilterKeyword)
      );

    return this.apollo
      .watchQuery({
        query: GET_USER_ACCOUNTS_QUERY,
        variables: {
          cursor,
          filterKeyword,
        },
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ userAccounts: IBaseConnection }>) => {
          const data = result.data.userAccounts;
          const errors = result.errors;
          const endCursor = data.pageInfo.endCursor;
          const hasNextPage = data.pageInfo.hasNextPage;
          const totalCount = data.totalCount;
          const userAccountsDto = <Array<User>>data.nodes;

          const userAccounts: Array<User> = userAccountsDto.map((currentUser) => {
            const user = new User();
            user.id = currentUser.id;
            user.firstName = currentUser.firstName;
            user.middleName = currentUser.middleName;
            user.lastName = currentUser.lastName;
            user.username = currentUser.username;
            user.gender = <GenderEnum>(currentUser.gender);
            user.emailAddress = currentUser.emailAddress;
            user.username = currentUser.username;
            user.isActive = currentUser.isActive;
            user.userPermissions = currentUser.userPermissions;
            user.userType = this.getUserType(user);
            return user;
          });

          if (userAccounts) {
            return {
              endCursor,
              hasNextPage,
              userAccounts,
              totalCount
            };
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  getUserAccount(userId: number) {
    return this.apollo
      .watchQuery({
        query: GET_USER_ACCOUNT_QUERY,
        variables: {
          userId,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              userAccount: IUserAccountInformationQueryPayload;
            }>
          ) => {
            const data = result.data.userAccount;

            if (data.typename === 'UserAccountInformationResult') {
              const currentUser = <UserAccountInformationResult>result.data.userAccount;
              const user = new User();
              user.id = currentUser.id;
              user.firstName = currentUser.firstName;
              user.middleName = currentUser.middleName;
              user.lastName = currentUser.lastName;
              user.username = currentUser.username;
              user.gender = <GenderEnum>(currentUser.gender);
              user.emailAddress = currentUser.emailAddress;
              user.username = currentUser.username;
              user.isActive = currentUser.isActive;
              user.userPermissions = currentUser.userPermissions;
              user.userType = this.getUserType(user);
              return user;
            }
            if (data.typename === 'UserAccountNotExistsError')
              throw new Error(
                (<UserAccountNotExistsError>result.data.userAccount).message
              );

            return null;
          }
        )
      );
  }

  getUserSetting(userId: number) {
    return this.apollo
      .watchQuery({
        query: GET_USER_SETTINGS_QUERY,
        variables: {
          userId,
        },
      })
      .valueChanges.pipe(
        map(
          async (
            result: ApolloQueryResult<{
              userSetting: UserSetting;
            }>
          ) => {
            const data = result.data.userSetting;
            const userSetting = new UserSetting();
            userSetting.allowOrderConfirmation = data.allowOrderConfirmation;
            userSetting.allowOrderPayments = data.allowOrderPayments;
            userSetting.allowSendReceipt = data.allowSendReceipt;
            userSetting.allowAutoSendReceipt = data.allowAutoSendReceipt;
            this.userSetting.set(userSetting);
            await this.localUserSettingsDbService.saveLocalUserSettings(userSetting);
            return userSetting;
          }
        ),
        catchError((error) => { throw new Error(error); })
      );
  }

  async autoLoadUserSettings() {
    const localUserSettings = await this.localUserSettingsDbService.getLocalUserSettings()
    this.userSetting.set(localUserSettings);
  }

  async clearUserSettings() {
    await this.localUserSettingsDbService.clearLocalUserSettings();
  }

  updateAccountInformation(user: User) {
    const userAccountInput: IUserAccountInput = {
      id: user.id,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      gender: user.gender,
      emailAddress: user.emailAddress,
      username: user.username,
      newPassword: user.password,
      userPermissions: user.userPermissions.map((p) => {
        return <IUserPermissionInput>{
          id: p.id,
          moduleId: p.moduleId,
          permissionLevel: p.permissionLevel,
        };
      }),
    };

    return this.apollo
      .mutate({
        mutation: UPDATE_USER_CREDENTIALS,
        variables: {
          userAccountInput,
        },
      })
      .pipe(
        map(
          (
            result: MutationResult<{ updateUserAccount: IUpdateAccountOutput }>
          ) => {
            const output = result.data.updateUserAccount;
            const payload = output.userAccount;
            const errors = output.errors;

            if (payload) {
              return payload;
            }

            if (errors && errors.length > 0) {
              throw new Error(errors[0].message);
            }

            return null;
          }
        )
      );
  }

  deleteUserAccounts(userIds: Array<number>) {
    return this.apollo
      .mutate({
        mutation: DELETE_USER_ACCOUNTS_QUERY,
        variables: {
          userIds,
        },
      })
      .pipe(
        map(
          (
            result: MutationResult<{ boolean: boolean }>
          ) => {
            const payload = result.data.boolean;

            if (payload) {
              return payload;
            }

            return null;
          }
        ),
        catchError((error) => { throw new Error(error); })
      );
  }

  setUserAccountsStatus(userIds: Array<number>, state: boolean) {
    return this.apollo
      .mutate({
        mutation: SET_USER_ACCOUNTS_STATUS_QUERY,
        variables: {
          userIds,
          state
        },
      })
      .pipe(
        map(
          (
            result: MutationResult<{ boolean: boolean }>
          ) => {
            const payload = result.data.boolean;

            if (payload) {
              return payload;
            }

            return null;
          }
        ),
        catchError((error) => { throw new Error(error); })
      );
  }

  checkUsernameExists(userId: number, username: string) {
    return this.apollo
      .watchQuery({
        query: CHECK_USERNAME,
        variables: {
          userId,
          username,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              checkUsername: IUserAccountInformationQueryPayload;
            }>
          ) => {
            const data = result.data.checkUsername;
            if (data.typename === 'CheckUsernameInformationResult')
              return (<CheckUsernameInformationResult>result.data.checkUsername)
                .exists;

            return false;
          }
        )
      );
  }

  verifyUserAccount(username: string, password: string) {
    const loginInput: ILoginInput = {
      username,
      password,
    };
    return this.apollo
      .watchQuery({
        query: VERIFY_USER_ACCOUNT,
        variables: {
          loginInput,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              verifyUserAccount: IUserAccountInformationQueryPayload;
            }>
          ) => {
            const data = result.data.verifyUserAccount;
            if (data.typename === 'UserAccountInformationResult') {
              const user = new User();
              const currentUser = <UserAccountInformationResult>(
                result.data.verifyUserAccount
              );
              user.firstName = currentUser.firstName;
              user.middleName = currentUser.middleName;
              user.lastName = currentUser.lastName;
              user.username = currentUser.username;
              user.emailAddress = currentUser.emailAddress;

              currentUser.userPermissions.forEach(
                (permission: UserModulePermission) => {
                  const userPermission = new UserModulePermission();
                  userPermission.id = permission.id;
                  userPermission.moduleId = permission.moduleId;
                  userPermission.permissionLevel = permission.permissionLevel;
                  user.userPermissions.push(userPermission);
                }
              );

              return user;
            }

            if (data.typename === 'UserAccountNotExistsError')
              throw new Error(
                (<UserAccountNotExistsError>(
                  result.data.verifyUserAccount
                )).message
              );

            return null;
          }
        )
      );
  }

  getUserType(user: User): string {
    switch (user.getModulePrivilege(ModuleEnum.Distribution).value) {
      case 1:
        return this.translateService.instant('USER_TYPE.SALES_AGENT');
      case 2:
        return this.translateService.instant('USER_TYPE.MANAGER');
      case 3:
        return this.translateService.instant('USER_TYPE.ADMINISTRATOR');
      default:
        return '';
    }
  }
}
