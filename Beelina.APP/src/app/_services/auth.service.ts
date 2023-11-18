import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Store } from '@ngrx/store';
import { Apollo, gql, MutationResult } from 'apollo-angular';

import { ApolloQueryResult } from '@apollo/client/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { RoutingService } from './routing.service';
import { StorageService } from './storage.service';

import { GenderEnum } from '../_enum/gender.enum';
import { AppStateInterface } from '../_interfaces/app-state.interface';
import { ILoginInput } from '../_interfaces/inputs/ilogin.input';
import { IAuthenticationOutput } from '../_interfaces/outputs/ilogin.output';
import { IClientInformationQueryPayload } from '../_interfaces/payloads/iclient-information-query.payload';
import { AuthToken } from '../_models/auth-token.model';
import { ClientNotExistsError } from '../_models/errors/client-not-exists.error';
import { User } from '../_models/user.model';

import { ModuleEnum } from '../_enum/module.enum';
import { PermissionLevelEnum } from '../_enum/permission-level.enum';
import { IUserAccountInput } from '../_interfaces/inputs/iuser-account.input';
import { IUserPermissionInput } from '../_interfaces/inputs/iuser-permission.input';
import { IUpdateAccountOutput } from '../_interfaces/outputs/iupdate-account.output';
import { IUserAccountInformationQueryPayload } from '../_interfaces/payloads/iuser-account-information-query.payload';
import { UserAccountNotExistsError } from '../_models/errors/user-account-not-exists.error';
import { CheckUsernameInformationResult } from '../_models/results/check-usernamee-information-result';
import { UserAccountInformationResult } from '../_models/results/user-account-information-result';
import { UserModulePermission } from '../_models/user-module-permission';
import * as LoginActions from '../auth/store/actions';

const GET_CLIENT_INFORMATION_QUERY = gql`
  query ($clientName: String!) {
    clientInformation(clientName: $clientName) {
      typename: __typename
      ... on ClientInformationResult {
        name
        dBHashName
        dBName
      }
      ... on ClientNotExistsError {
        message
      }
    }
  }
`;

const LOGIN_QUERY = gql`
  mutation ($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      authenticationPayLoad {
        accessToken
        expiresIn
        refreshToken
      }
      errors {
        code: __typename
        ... on InvalidCredentialsError {
          message
        }
      }
    }
  }
`;

const REFRESH_QUERY = gql`
  mutation ($refreshAccountInput: RefreshAccountInput!) {
    refresh(input: { refreshAccountInput: $refreshAccountInput }) {
      authenticationPayLoad {
        accessToken
        expiresIn
        refreshToken
      }
      errors {
        code: __typename
        ... on UserAccountNotExistsError {
          message
        }
        ... on InvalidRefreshTokenError {
          message
        }
      }
    }
  }
`;

const UPDATE_USER_CREDENTIALS = gql`
  mutation ($userAccountForUpdateInput: UserAccountInput!) {
    updateUserAccount(
      input: { userAccountForUpdateInput: $userAccountForUpdateInput }
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

const GET_USER_INFORMATION = gql`
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = new BehaviorSubject<User>(null);
  private _tokenInfo = new BehaviorSubject<AuthToken>(null);
  private _currentUserFullname = new BehaviorSubject<string>('');
  private _currentUsername = new BehaviorSubject<string>('');
  private _tokenExpirationTimer: any;
  private _jwtHelper = new JwtHelperService();

  constructor(
    private apollo: Apollo,
    private routingService: RoutingService,
    private storageService: StorageService,
    private store: Store<AppStateInterface>
  ) {}

  get user() {
    return this._user;
  }

  get currentFullname() {
    return this._currentUserFullname;
  }

  get currentUsername() {
    return this._currentUsername;
  }

  get authToken() {
    return this._tokenInfo.asObservable();
  }

  login(username: string, password: string) {
    const loginInput: ILoginInput = {
      username,
      password,
    };

    return this.apollo
      .mutate({
        mutation: LOGIN_QUERY,
        variables: {
          loginInput,
        },
      })
      .pipe(
        map((result: MutationResult<{ login: IAuthenticationOutput }>) => {
          const output = result.data.login;
          const payload = output.authenticationPayLoad;
          const errors = output.errors;

          if (payload) {
            return payload;
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  checkCompany(company: string) {
    return this.apollo
      .watchQuery({
        query: GET_CLIENT_INFORMATION_QUERY,
        variables: {
          clientName: company,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              clientInformation: IClientInformationQueryPayload;
            }>
          ) => {
            const data = result.data.clientInformation;

            if (data.typename === 'ClientInformationResult')
              return result.data.clientInformation;
            if (data.typename === 'ClientNotExistsError')
              throw new Error(
                (<ClientNotExistsError>result.data.clientInformation).message
              );

            return null;
          }
        )
      );
  }

  refresh() {
    const storedTokenInfo = <string>this.storageService.getString('authToken');

    const tokenInfo: {
      _accessToken: string;
      _refreshToken: string;
      _refreshTokenExpirationDate: Date;
    } = JSON.parse(storedTokenInfo);

    const authToken = new AuthToken(
      tokenInfo._accessToken,
      tokenInfo._refreshToken,
      new Date(tokenInfo._refreshTokenExpirationDate)
    );

    return this.apollo
      .mutate({
        mutation: REFRESH_QUERY,
        variables: {
          refreshAccountInput: {
            accessToken: authToken.token,
            refreshToken: authToken.refreshToken,
          },
        },
      })
      .pipe(
        map((result: MutationResult<{ refresh: IAuthenticationOutput }>) => {
          const output = result.data.refresh;
          const payload = output.authenticationPayLoad;
          const errors = output.errors;

          if (payload) {
            this.handleLogin(
              payload.accessToken,
              payload.refreshToken,
              payload.expiresIn
            );
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }
        })
      );
  }

  logout(url?: string) {
    let redirectUrl = '/auth';
    this._user.next(null);
    this._tokenInfo.next(null);

    this.storageService.remove('userData');
    this.storageService.remove('authToken');
    this.storageService.remove('company');
    this.storageService.remove('appSecretToken');
    this.storageService.remove('productTransactions');
    this.storageService.remove('allowManageProductDetails');
    this.storageService.remove('currentSalesAgentId');

    this.store.dispatch(LoginActions.reserLoginCredentials());

    if (this._tokenExpirationTimer) {
      clearTimeout(this._tokenExpirationTimer);
    }

    if (url) {
      redirectUrl = url;
    }

    this.routingService.replace([redirectUrl]);
  }

  updateAccountInformation(user: User) {
    const userAccountForUpdateInput: IUserAccountInput = {
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
          userAccountForUpdateInput,
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

  getUserInformation(userId: number) {
    return this.apollo
      .watchQuery({
        query: GET_USER_INFORMATION,
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

            if (data.typename === 'UserAccountInformationResult')
              return result.data.userAccount;
            if (data.typename === 'UserAccountNotExistsError')
              throw new Error(
                (<UserAccountNotExistsError>result.data.userAccount).message
              );

            return null;
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

  autoLogin() {
    if (
      !this.storageService.hasKey('authToken') ||
      !this.storageService.hasKey('userData')
    ) {
      return of(false);
    }

    const authToken: {
      _accessToken: string;
      _refreshToken: string;
      _refreshTokenExpirationDate: Date;
    } = JSON.parse(<string>this.storageService.getString('authToken'));

    const user: {
      id: number;
      firstName: string;
      middleName: string;
      lastName: string;
      username: string;
      gender: GenderEnum;
      emailAddress: string;
      userPermissions: Array<UserModulePermission>;
    } = JSON.parse(<string>this.storageService.getString('userData'));

    const tokenInfo = new AuthToken(
      authToken._accessToken,
      authToken._refreshToken,
      new Date(authToken._refreshTokenExpirationDate)
    );

    const loadedUser = new User();
    loadedUser.id = user.id;
    loadedUser.firstName = user.firstName;
    loadedUser.middleName = user.middleName;
    loadedUser.lastName = user.lastName;
    loadedUser.username = user.username;
    loadedUser.gender = user.gender;
    loadedUser.emailAddress = user.emailAddress;
    loadedUser.userPermissions.push(...user.userPermissions);

    if (tokenInfo.isAuth) {
      this._user.next(loadedUser);
      this._tokenInfo.next(tokenInfo);
      this._currentUserFullname.next(loadedUser.fullname);
      this._currentUsername.next(loadedUser.username);

      this.autoLogout(tokenInfo.timeToExpiry);
      return of(true);
    }

    return of(false);
  }

  autoLogout(expiryDuration: number) {
    this._tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expiryDuration);
  }

  checkUserAcces(): Observable<boolean> | Promise<boolean> | boolean {
    return this.authToken.pipe(
      take(1),
      switchMap((tokenInfo: AuthToken) => {
        if (!tokenInfo || !tokenInfo.token) {
          return this.autoLogin();
        }

        return of(true);
      }),
      tap((isAuth) => {
        if (!isAuth) {
          this.routingService.replace(['/auth']);
        }
      })
    );
  }

  handleLogin(accessToken: string, refreshToken: string, expiresIn: Date) {
    const expirationDate = new Date(expiresIn);

    const authToken = new AuthToken(accessToken, refreshToken, expirationDate);
    const currentUser = this._jwtHelper.decodeToken(authToken.token);

    const user = new User();
    user.id = +currentUser.nameid;
    user.firstName = currentUser.firstName;
    user.middleName = currentUser.middleName;
    user.lastName = currentUser.lastName;
    user.username = currentUser.username;
    user.gender = parseInt(currentUser.gender);
    user.emailAddress = currentUser.emailAddress;

    // Keep user permission per module
    // (1) Retail Module
    if (currentUser.retailModulePrivilege) {
      user.setModulePrivilege(
        ModuleEnum.Retail,
        <PermissionLevelEnum>currentUser.retailModulePrivilege.toUpperCase()
      );
    }

    this.storageService.storeString('authToken', JSON.stringify(authToken));
    this.storageService.storeString('userData', JSON.stringify(user));

    this.autoLogout(authToken.timeToExpiry);

    this._tokenInfo.next(authToken);
    this._user.next(user);

    this._currentUserFullname.next(user.fullname);
    this._currentUsername.next(user.username);
  }

  get userId(): number {
    const tokenDecrypted = this._jwtHelper.decodeToken(
      this._tokenInfo.value.token
    );

    return parseInt(tokenDecrypted.nameid);
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
}
