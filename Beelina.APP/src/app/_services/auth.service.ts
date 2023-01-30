import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Apollo, gql, MutationResult, Query } from 'apollo-angular';

import { map, switchMap, take, tap } from 'rxjs/operators';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { ApolloQueryResult } from '@apollo/client';

import { environment } from '../../environments/environment';

import { RoutingService } from './routing.service';
import { StorageService } from './storage.service';

import { User } from '../_models/user.model';
import { AuthToken } from '../_models/auth-token.model';
import { GenderEnum } from '../_enum/gender.enum';
import { ILoginInput } from '../_interfaces/inputs/ilogin.input';
import { ILoginOutput } from '../_interfaces/outputs/ilogin.output';
import { IAuthResponseOutput } from '../_interfaces/outputs/iauth-response.output';
import { IClientInformationQueryPayload } from '../_interfaces/payloads/iclient-information-query.payload';
import { ClientNotExistsError } from '../_models/errors/client-not-exists.error';

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
      loginPayLoad {
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
    private http: HttpClient,
    private routingService: RoutingService,
    private storageService: StorageService
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
        map((result: MutationResult<{ login: ILoginOutput }>) => {
          const output = result.data.login;
          const payload = output.loginPayLoad;
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

  refresh(): Observable<IAuthResponseOutput> {
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

    return this.http
      .post<IAuthResponseOutput>(
        `${environment.beelinaAPIEndPoint}/auth/refresh`,
        {
          accessToken: authToken.token,
          refreshToken: authToken.refreshToken,
        }
      )
      .pipe(
        tap((resData) => {
          if (resData && resData.accessToken) {
            this.handleLogin(
              resData.accessToken,
              resData.refreshToken,
              resData.expiresIn
            );
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
    this.storageService.remove('app-secret-token');

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
      firstName: string;
      middleName: string;
      lastName: string;
      username: string;
      gender: GenderEnum;
      emailAddress: string;
    } = JSON.parse(<string>this.storageService.getString('userData'));

    const tokenInfo = new AuthToken(
      authToken._accessToken,
      authToken._refreshToken,
      new Date(authToken._refreshTokenExpirationDate)
    );

    const loadedUser = new User(
      user.firstName,
      user.middleName,
      user.lastName,
      user.username,
      user.gender,
      user.emailAddress
    );

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

    const user = new User(
      currentUser.firstName,
      currentUser.middleName,
      currentUser.lastName,
      currentUser.username,
      parseInt(currentUser.gender),
      currentUser.emailAddress
    );

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
}
