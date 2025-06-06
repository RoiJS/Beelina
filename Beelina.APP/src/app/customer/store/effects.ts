import { inject, Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, from, map, of, switchMap } from 'rxjs';

import * as CustomerActions from './actions';

import { CustomerStore } from 'src/app/_models/customer-store';
import { CustomerStoreService } from 'src/app/_services/customer-store.service';
import { LocalCustomerStoresDbService } from 'src/app/_services/local-db/local-customer-stores-db.service';
import { NetworkService } from 'src/app/_services/network.service';

@Injectable()
export class CustomerEffects {

  private actions$ = inject(Actions);
  private customerStoreService = inject(CustomerStoreService);
  private localCustomerStoresDbService = inject(LocalCustomerStoresDbService);
  private networkService = inject(NetworkService);

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

  getCustomersPerBarangay$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.getCustomerStorePerBarangayAction),
      switchMap((action: { barangayName: string }) => {
        return this.customerStoreService
          .getCustomerStoresPerBarangay(action.barangayName)
          .pipe(
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

        if (!this.networkService.isOnline.value) {
          return from(this.localCustomerStoresDbService.getMyLocalCustomerStores()).pipe(
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
        }

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
}
