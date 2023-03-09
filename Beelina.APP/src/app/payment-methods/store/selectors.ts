import { createSelector } from '@ngrx/store';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

export const selectFeature = (state: AppStateInterface) =>
  state.paymentMethods;

export const  paymentMethodsSelector = createSelector(
  selectFeature,
  (state) => state.paymentMethods
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
