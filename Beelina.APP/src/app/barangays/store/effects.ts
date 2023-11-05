import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, delay, map, of, switchMap } from 'rxjs';

import * as BarangayActions from './actions';

import { Barangay } from 'src/app/_models/barangay';

import { BarangayService } from 'src/app/_services/barangay.service';

@Injectable()
export class BarangaysEffects {
  barangays$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BarangayActions.getBarangaysAction),
      switchMap(() => {
        return this.barangayService.getBarangays().pipe(
          delay(1000),
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
    private barangayService: BarangayService
  ) {}
}
