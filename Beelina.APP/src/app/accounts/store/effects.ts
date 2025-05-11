import { inject, Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, map, of, switchMap } from 'rxjs';

import * as UerAccountActions from './actions';

import { User } from 'src/app/_models/user.model';

import { UserAccountService } from 'src/app/_services/user-account.service';

@Injectable()
export class UserAccountEffects {

  private actions$ = inject(Actions);
  private userAccountService = inject(UserAccountService);

  userAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UerAccountActions.getUserAccountsAction),
      switchMap(() => {
        return this.userAccountService.getUserAccounts().pipe(
          map(
            (data: {
              endCursor: string;
              hasNextPage: boolean;
              userAccounts: Array<User>;
              totalCount: number;
            }) => {
              return UerAccountActions.getUserAccountsActionSuccess({
                userAccounts: data.userAccounts,
                endCursor: data.endCursor,
                hasNextPage: data.hasNextPage,
                totalCount: data.totalCount,
              });
            }
          ),
          catchError((error) =>
            of(
              UerAccountActions.getUserAccountsActionError({
                error: error.message,
              })
            )
          )
        );
      })
    )
  );
}
