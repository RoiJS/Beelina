import { createAction, props } from '@ngrx/store';

import { SortOrderOptionsEnum } from 'src/app/_enum/sort-order-options.enum';
import { TopSellingProduct } from 'src/app/_services/transaction.service';

export const getTopSellingProductsAction = createAction('[Top Product] Get Top Selling Products', props<{ userId: number }>());

export const getTopSellingProductsActionSuccess = createAction(
  '[Top Product] Get Top Selling Products Success',
  props<{
    endCursor: string;
    hasNextPage: boolean;
    topSellingProducts: Array<TopSellingProduct>;
    totalCount: number;
  }>()
);

export const getTopSellingProductsActionError = createAction(
  '[Top Product] Get Top Selling Products Error',
  props<{ error: string }>()
);

export const setUpdateTopProductLoadingState = createAction(
  '[Top Product] Set Update Top Selling Product Loading State',
  props<{ state: boolean }>()
);

export const setSortAndfilterTopSellingProductsDatesAction = createAction(
  '[Top Product] Sort and Filter Top Selling Products',
  props<{
    dateStart: string;
    dateEnd: string;
    sortOrder: SortOrderOptionsEnum;
  }>()
);


export const resetTopSellingProductState = createAction('[Top Product] Reset Top Selling Product State');

