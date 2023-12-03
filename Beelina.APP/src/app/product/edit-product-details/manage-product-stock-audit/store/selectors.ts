import { createSelector } from '@ngrx/store';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

export const selectFeature = (state: AppStateInterface) => state.productStockAudits;

export const productStockAuditsSelector = createSelector(
  selectFeature,
  (state) => state.productStockAudits
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
