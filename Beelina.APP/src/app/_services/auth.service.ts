import { inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Store } from '@ngrx/store';
import { Apollo, gql, MutationResult } from 'apollo-angular';

import { ApolloQueryResult } from '@apollo/client/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { UserAccountService } from './user-account.service';
import { RoutingService } from './routing.service';
import { StorageService } from './storage.service';
import { ProductService } from './product.service';
import { SupplierService } from './supplier.service';
import { CustomerStoreService } from './customer-store.service';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import { AuthToken } from '../_models/auth-token.model';
import { User } from '../_models/user.model';

import { BusinessModelEnum } from '../_enum/business-model.enum';
import { GenderEnum } from '../_enum/gender.enum';
import { ModuleEnum } from '../_enum/module.enum';
import { PermissionLevelEnum } from '../_enum/permission-level.enum';
import { SalesAgentTypeEnum } from '../_enum/sales-agent-type.enum';

import { IAuthenticationOutput } from '../_interfaces/outputs/ilogin.output';
import { ILoginInput } from '../_interfaces/inputs/ilogin.input';
import { IClientInformationQueryPayload } from '../_interfaces/payloads/iclient-information-query.payload';
import { ClientNotExistsError } from '../_models/errors/client-not-exists.error';
import { UserModulePermission } from '../_models/user-module-permission';
import * as LoginActions from '../auth/store/actions';
import * as ProductTransactionActions from '../product/add-to-cart-product/store/actions';

const GET_CLIENT_INFORMATION_QUERY = gql`
  query ($clientName: String!) {
    clientInformation(clientName: $clientName) {
      typename: __typename
      ... on ClientInformationResult {
        name
        dbHashName
        dbName
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
        ... on SystemUpdateActiveError {
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = new BehaviorSubject<User>(null);
  private _tokenInfo = new BehaviorSubject<AuthToken>(null);
  private _currentUserFullname = new BehaviorSubject<string>('');
  private _currentUsername = new BehaviorSubject<string>('');
  private _company = new BehaviorSubject<string>('');
  private _tokenExpirationTimer: any;
  private _jwtHelper = new JwtHelperService();

  private apollo = inject(Apollo);
  private routingService = inject(RoutingService);
  private storageService = inject(StorageService);
  private store = inject(Store<AppStateInterface>);
  private userAccountService = inject(UserAccountService);
  private productService = inject(ProductService);
  private supplierService = inject(SupplierService);
  private customerStoreService = inject(CustomerStoreService);

  constructor() {
    this._company.next(this.storageService.getString('company'));
  }

  get user() {
    return this._user;
  }

  get company() {
    return this._company;
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

  get userId(): number {
    const tokenDecrypted = this._jwtHelper.decodeToken(
      this._tokenInfo.value.token
    );

    return parseInt(tokenDecrypted.nameid);
  }

  get businessModel(): BusinessModelEnum {
    const tokenDecrypted = this._jwtHelper.decodeToken(
      this._tokenInfo.value.token
    );

    return <BusinessModelEnum>(parseInt(tokenDecrypted.businessModel));
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

    // Invalidate all caches to prevent cross-session/tenant data leakage
    this.productService.invalidateSalesAgentsCache();
    this.supplierService.invalidateSuppliersCache();
    this.customerStoreService.invalidateCustomersCache();

    this.storageService.remove('userData');
    this.storageService.remove('authToken');
    this.storageService.remove('company');
    this.storageService.remove('appSecretToken');
    this.storageService.remove('productTransactions');
    this.storageService.remove('allowManageProductDetails');
    this.storageService.remove('currentSalesAgentId');
    this.storageService.remove("textOrder");
    this.storageService.remove("textInventories");
    this.storageService.remove("textInventoriesList");
    this.storageService.remove("productCartForm");
    this.storageService.remove("currentSalesAgentType");

    this.store.dispatch(LoginActions.resetLoginCredentials());
    this.store.dispatch(ProductTransactionActions.resetProductTransactionState());

    if (this._tokenExpirationTimer) {
      clearTimeout(this._tokenExpirationTimer);
    }

    if (url) {
      redirectUrl = url;
    }

    this.routingService.replace([redirectUrl]);
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
      businessModel: BusinessModelEnum;
      salesAgentType: SalesAgentTypeEnum;
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
    loadedUser.businessModel = user.businessModel;
    loadedUser.salesAgentType = user.salesAgentType;
    loadedUser.userPermissions.push(...user.userPermissions);

    if (tokenInfo.isAuth) {
      this._user.next(loadedUser);
      this._tokenInfo.next(tokenInfo);
      this._currentUserFullname.next(loadedUser.fullname);
      this._currentUsername.next(loadedUser.username);

      this.userAccountService.autoLoadUserSettings();
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

  checkAdministratorAcces(): Observable<boolean> | Promise<boolean> | boolean {
    return this._user.pipe(
      take(1),
      switchMap((user: User) => {
        const isAdmin = user.getModulePrivilege(ModuleEnum.Distribution).value === 3;
        return of(isAdmin);
      }),
      tap((isAdmin) => {
        if (!isAdmin) {
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
    user.businessModel = parseInt(currentUser.businessModel);
    user.salesAgentType = user.getSalesAgentType(parseInt(currentUser.salesAgentType));

    // Keep user permission per module
    // (1) Distribution Module
    if (currentUser.distributionModulePrivilege) {
      user.setModulePrivilege(
        ModuleEnum.Distribution,
        <PermissionLevelEnum>currentUser.distributionModulePrivilege.toUpperCase()
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
}
