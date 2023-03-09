import { createAction, props } from '@ngrx/store';
import { ProductUnit } from 'src/app/_services/product-unit.service';

export const getProductUnitsAction = createAction(
  '[Product Units] Get Product Units'
);

export const getProductUnitsActionSuccess = createAction(
  '[Product Units] Get Product Units Success',
  props<{
    endCursor: string;
    hasNextPage: boolean;
    productUnits: Array<ProductUnit>;
  }>()
);

export const getProductUnitsActionError = createAction(
  '[Product Units] Get Product Units Error',
  props<{ error: string }>()
);
