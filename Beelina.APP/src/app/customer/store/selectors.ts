import { createSelector } from '@ngrx/store';
import { AppStateInterface } from '../../_interfaces/app-state.interface';

export const selectFeature = (state: AppStateInterface) => state.customerStores;

export const customerStoresSelector = createSelector(
  selectFeature,
  (state) => state.customers
);

export const endCursorSelector = createSelector(
  selectFeature,
  (state) => state.endCursor
);

export const hasNextPageSelector = createSelector(
  selectFeature,
  (state) => state.hasNextPage
);

export const isLoadingSelector = createSelector(
  selectFeature,
  (state) => state.isLoading
);

export const errorSelector = createSelector(
  selectFeature,
  (state) => state.error
);

export const isUpdateLoadingSelector = createSelector(
  selectFeature,
  (state) => state.isUpdateLoading
);

export const filterKeywordSelector = createSelector(
  selectFeature,
  (state) => state.filterKeyword
);
