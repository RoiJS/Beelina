import { createSelector } from '@ngrx/store';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

export const selectFeature = (state: AppStateInterface) =>
  state.userAccounts;

export const userAccountsSelector = createSelector(
  selectFeature,
  (state) => state.userAccounts
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

export const filterKeywordSelector = createSelector(
  selectFeature,
  (state) => state.filterKeyword
);

export const totalCountSelector = createSelector(
  selectFeature,
  (state) => state.totalCount
);
