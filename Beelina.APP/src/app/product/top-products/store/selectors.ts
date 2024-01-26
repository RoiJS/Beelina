import { createSelector } from '@ngrx/store';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

export const selectFeature = (state: AppStateInterface) => state.topSellingProducts;

export const topSellingProductsSelector = createSelector(
  selectFeature,
  (state) => state.topSellingProducts
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

export const totalCountSelector = createSelector(
  selectFeature,
  (state) => state.totalCount
);

export const sortOrderSelector = createSelector(
  selectFeature,
  (state) => state.sortOrder
);

export const fromDateSelector = createSelector(
  selectFeature,
  (state) => state.fromDate
);

export const toDateSelector = createSelector(
  selectFeature,
  (state) => state.toDate
);
