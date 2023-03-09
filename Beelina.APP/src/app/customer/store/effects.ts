import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import * as CustomerActions from './actions';

import {
  CustomerStore,
  CustomerStoreService,
} from 'src/app/_services/customer-store.service';

@Injectable()
export class CustomerEffects {
  getCustomers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.getCustomerStoreAction),
      switchMap(() => {
        return this.customerStoreService.getCustomerStores().pipe(
          map(
            (data: {
              endCursor: string;
              hasNextPage: boolean;
              customerStores: Array<CustomerStore>;
            }) => {
              return CustomerActions.getCustomerStoreActionSuccess({
                customers: data.customerStores,
                endCursor: data.endCursor,
                hasNextPage: data.hasNextPage,
              });
            }
          ),
          catchError((error) =>
            of(
              CustomerActions.getCustomerStoreActionError({
                error: error.message,
              })
            )
          )
        );
      })
    )
  );

  getAllCustomers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.getAllCustomerStoreAction),
      switchMap(() => {
        return this.customerStoreService.getAllCustomerStores().pipe(
          map((customerStores: Array<CustomerStore>) => {
            return CustomerActions.getCustomerStoreActionSuccess({
              customers: customerStores,
              endCursor: null,
              hasNextPage: false,
            });
          }),
          catchError((error) =>
            of(
              CustomerActions.getCustomerStoreActionError({
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
    private customerStoreService: CustomerStoreService
  ) {}
}
