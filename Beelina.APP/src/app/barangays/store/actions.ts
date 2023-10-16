import { createAction, props } from '@ngrx/store';

import { Barangay } from 'src/app/_models/barangay';

export const getBarangaysAction = createAction(
  '[Barangay] Get Barangays Methods'
);

export const getAllBarangayAction = createAction(
  '[Barangay] Get All Barangays'
);

export const getBarangaysActionSuccess = createAction(
  '[Barangay] Get Barangay Methods Success',
  props<{
    endCursor: string;
    hasNextPage: boolean;
    barangays: Array<Barangay>;
  }>()
);

export const getBarangaysActionError = createAction(
  '[Barangay] Get Barangays Methods Error',
  props<{ error: string }>()
);

export const resetBarangayState = createAction(
  '[Barangay] Reset Barangay State'
);

export const resetBarangayList = createAction(
  '[Barangay] Reset Barangay List'
);

export const setSearchBarangaysAction = createAction(
  '[Barangay] Search Barangays',
  props<{ keyword: string }>()
);
