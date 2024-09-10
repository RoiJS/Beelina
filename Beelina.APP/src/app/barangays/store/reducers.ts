import { createReducer, on } from '@ngrx/store';

import * as BarangayActions from './actions';

import { IBarangayState } from '../types/barangay.interface';

import { Barangay } from 'src/app/_models/barangay';

export const initialState: IBarangayState = {
  isLoading: false,
  isUpdateLoading: false,
  barangays: new Array<Barangay>(),
  endCursor: null,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
};

export const reducers = createReducer(
  initialState,
  on(
    BarangayActions.getBarangaysAction,
    (state, action) =>
      <IBarangayState>{
        ...state,
        isLoading: true,
      }
  ),
  on(
    BarangayActions.getBarangaysActionSuccess,
    (state, action) =>
      <IBarangayState>{
        ...state,
        isLoading: false,
        endCursor: action.endCursor,
        barangays: state.barangays.concat(action.barangays),
      }
  ),
  on(
    BarangayActions.getBarangaysActionError,
    (state, action) =>
      <IBarangayState>{
        ...state,
        error: action.error,
        isLoading: false
      }
  ),
  on(BarangayActions.resetBarangayState, (state, action) => ({
    ...initialState,
  })),
  on(BarangayActions.setSearchBarangaysAction, (state, action) => ({
    ...state,
    filterKeyword: action.keyword,
  })),
  on(BarangayActions.resetBarangayList, (state, action) => ({
    ...state,
    barangays: initialState.barangays,
    endCursor: initialState.endCursor,
  }))
);
