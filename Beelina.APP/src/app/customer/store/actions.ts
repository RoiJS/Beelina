import { createAction, props } from '@ngrx/store';
import { CustomerStore } from 'src/app/_models/customer-store';

export const getCustomerStoreAction = createAction('[Customer] Get Customers');

export const getCustomerStorePerBarangayAction = createAction(
  '[Customer] Get Customers Per Barangay',
  props<{ barangayName: string }>()
);

export const getAllCustomerStoreAction = createAction(
  '[Customer] Get All Customers'
);

export const getCustomerStoreActionSuccess = createAction(
  '[Customer] Get Customers Success',
  props<{
    endCursor: string;
    hasNextPage: boolean;
    customers: Array<CustomerStore>;
  }>()
);

export const setSearchCustomersAction = createAction(
  '[Customer] Search Customer',
  props<{ keyword: string }>()
);

export const getCustomerStoreActionError = createAction(
  '[Customer] Get Customers Failed',
  props<{ error: string }>()
);

export const setUpdateCustomerLoadingState = createAction(
  '[Customer] Set Update Customer Loading State',
  props<{ state: boolean }>()
);

export const resetCustomerState = createAction(
  '[Customer] Reset Customer State'
);
