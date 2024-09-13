import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, from, map, of, switchMap } from 'rxjs';

import * as BarangayActions from './actions';

import { Barangay } from 'src/app/_models/barangay';

import { BarangayService } from 'src/app/_services/barangay.service';
import { LocalCustomerAccountsDbService } from 'src/app/_services/local-db/local-customer-accounts-db.service';
import { NetworkService } from 'src/app/_services/network.service';

@Injectable()
export class BarangaysEffects {
  barangays$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BarangayActions.getBarangaysAction),
      switchMap(() => {
        return this.barangayService.getBarangays().pipe(
          map(
            (data: {
              endCursor: string;
              hasNextPage: boolean;
              barangays: Array<Barangay>;
            }) => {
              return BarangayActions.getBarangaysActionSuccess({
                barangays: data.barangays,
                endCursor: data.endCursor,
                hasNextPage: data.hasNextPage,
              });
            }
          ),
          catchError((error) =>
            of(
              BarangayActions.getBarangaysActionError({
                error: error.message,
              })
            )
          )
        );
      })
    )
  );

  getAllBarangays$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BarangayActions.getAllBarangayAction),
      switchMap(() => {

        if (!this.networkService.isOnline.value) {
          return from(this.localCustomerAccountsDbService.getMyLocalCustomerAccounts()).pipe(
            map((barangays: Array<Barangay>) => {
              return BarangayActions.getBarangaysActionSuccess({
                barangays: barangays,
                endCursor: null,
                hasNextPage: false,
              });
            }),
            catchError((error) =>
              of(
                BarangayActions.getBarangaysActionError({
                  error: error.message,
                })
              )
            )
          );
        }

        return this.barangayService.getAllBarangays().pipe(
          map((barangays: Array<Barangay>) => {
            return BarangayActions.getBarangaysActionSuccess({
              barangays: barangays,
              endCursor: null,
              hasNextPage: false,
            });
          }),
          catchError((error) =>
            of(
              BarangayActions.getBarangaysActionError({
                error: error.message,
              })
            )
          )
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private barangayService: BarangayService,
    private localCustomerAccountsDbService: LocalCustomerAccountsDbService,
    private networkService: NetworkService
  ) { }
}
