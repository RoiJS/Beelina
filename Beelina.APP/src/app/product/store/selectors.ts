import { createSelector } from '@ngrx/store';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

export const selectFeature = (state: AppStateInterface) => state.products;

export const productsSelector = createSelector(
  selectFeature,
  (state) => state.products
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

export const supplierIdSelector = createSelector(
  selectFeature,
  (state) => state.supplierId
);

export const stockStatusSelector = createSelector(
  selectFeature,
  (state) => state.stockStatus
);

export const priceStatusSelector = createSelector(
  selectFeature,
  (state) => state.priceStatus
);

export const totalCountSelector = createSelector(
  selectFeature,
  (state) => state.totalCount
);

export const textInventoriesSelector = createSelector(
  selectFeature,
  (state) => state.textProductInventories
);
