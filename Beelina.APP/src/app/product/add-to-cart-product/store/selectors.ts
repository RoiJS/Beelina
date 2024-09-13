import { createSelector } from '@ngrx/store';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

export const selectFeature = (state: AppStateInterface) =>
  state.productTransactions;

export const productTransactionsSelector = createSelector(
  selectFeature,
  (state) => state.productTransactions
);

export const transactionsSelector = createSelector(
  selectFeature,
  (state) => state.transaction
);

export const isLoadingSelector = createSelector(
  selectFeature,
  (state) => state.isLoading
);
