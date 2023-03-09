import { createReducer, on } from '@ngrx/store';
import { CustomerStore } from 'src/app/_services/customer-store.service';
import { ICustomerStoreState } from '../types/payment-method-state.interface';

import * as CustomerActions from './actions';

export const initialState: ICustomerStoreState = {
  isLoading: false,
  isUpdateLoading: false,
  customers: new Array<CustomerStore>(),
  hasNextPage: false,
  endCursor: null,
  filterKeyword: '',
  error: null,
};

export const reducers = createReducer(
  initialState,
  on(CustomerActions.getCustomerStoreAction, (state, action) => ({
    ...state,
    isLoading: true,
  })),
  on(
    CustomerActions.getCustomerStoreActionSuccess,
    (state, action) =>
      <ICustomerStoreState>{
        ...state,
        isLoading: false,
        endCursor: action.endCursor,
        customers: state.customers.concat(action.customers),
      }
  ),
  on(CustomerActions.getCustomerStoreActionError, (state, action) => ({
    ...state,
    error: action.error,
  })),
  on(CustomerActions.setUpdateCustomerLoadingState, (state, action) => ({
    ...state,
    isUpdateLoading: action.state,
  })),
  on(CustomerActions.setSearchCustomersAction, (state, action) => ({
    ...state,
    filterKeyword: action.keyword,
  })),
  on(CustomerActions.resetCustomerState, (state, action) => ({
    ...initialState,
  }))
);
