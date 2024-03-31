import { createAction, props } from '@ngrx/store';
import { IProductPayload } from 'src/app/_interfaces/payloads/iproduct.payload';
import { Product } from 'src/app/_models/product';

export const getWarehouseProductsAction = createAction('[Warehouse Product] Get Warehouse Products');

export const getWarehouseProductsCancelAction = createAction('[Warehouse Product] Get Warehouse Products Cancel');

export const getWarehouseProductsActionSuccess = createAction(
  '[Warehouse Product] Get Warehouse Product Success',
  props<{
    endCursor: string;
    hasNextPage: boolean;
    products: Array<Product>;
    totalCount: number;
  }>()
);

export const getWarehouseProductsActionError = createAction(
  '[Warehouse Product] Get Warehouse Product Error',
  props<{ error: string }>()
);

export const importWarehouseProductsAction = createAction('[Warehouse Product] Import Warehouse Products',
  props<{ products: Array<Product> }>()
);

export const importWarehouseProductsCancelAction = createAction('[Warehouse Product] Import Warehouse Products Cancel');

export const importWarehouseProductsActionSuccess = createAction('[Warehouse Product] Import Warehouse Product Success',
  props<{ importedProducts: Array<IProductPayload> }>()
);

export const importWarehouseProductsActionError = createAction(
  '[Warehouse Product] Import Warehouse Product Error',
  props<{ error: string }>()
);

export const setUpdateWarehouseProductLoadingState = createAction(
  '[Warehouse Product] Set Update Warehouse Product Loading State',
  props<{ state: boolean }>()
);

export const setUpdateWarehouseImportProductLoadingState = createAction(
  '[Warehouse Product] Set Update Warehouse Import Product Loading State',
  props<{ state: boolean }>()
);

export const setSearchWarehouseProductAction = createAction(
  '[Warehouse Product] Search Warehouse Products',
  props<{ keyword: string }>()
);

export const resetWarehouseProductState = createAction('[Product] Reset Product State');

// export const resetTextInventoriesState = createAction('[Product] Reset Text Inventories State');

// export const analyzeTextInventories = createAction(
//   '[Product] Analyze Text Inventories',
//   props<{ textInventories: string }>()
// );

// export const analyzeTextInventoriesActionSuccess = createAction(
//   '[Product] Analyze Text Inventories Success',
//   props<{
//     textProductInventories: Array<Product>;
//   }>()
// );
