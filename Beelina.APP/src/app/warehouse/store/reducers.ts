import { createReducer, on } from '@ngrx/store';

import { Product } from '../../_models/product';
import { IProductState } from '../../product/types/product-state.interface';
import * as ProductActions from './actions';
import { IProductPayload } from 'src/app/_interfaces/payloads/iproduct.payload';
import { StockStatusEnum } from 'src/app/_enum/stock-status.enum';
import { PriceStatusEnum } from 'src/app/_enum/price-status.enum';
import { ProductActiveStatusEnum } from 'src/app/_enum/product-active-status.enum';

export const initialState: IProductState = {
  isLoading: false,
  isUpdateLoading: false,
  products: new Array<Product>(),
  importLoading: false,
  importProductsResult: false,
  importedProducts: new Array<IProductPayload>(),
  textProductInventories: new Array<Product>(),
  endCursor: null,
  totalCount: 0,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
  supplierId: 0,
  stockStatus: StockStatusEnum.All,
  priceStatus: PriceStatusEnum.All,
  activeStatus: ProductActiveStatusEnum.ActiveOnly
};

export const reducers = createReducer(
  initialState,
  on(
    ProductActions.getWarehouseProductsAction,
    (state, action) =>
      <IProductState>{
        ...state,
        isLoading: (state.endCursor === null),
      }
  ),
  on(
    ProductActions.getWarehouseProductsActionSuccess,
    (state, action) =>
      <IProductState>{
        ...state,
        isLoading: false,
        endCursor: action.endCursor,
        totalCount: action.totalCount,
        products: state.products.concat(action.products),
      }
  ),
  on(
    ProductActions.getWarehouseProductsActionError,
    (state, action) =>
      <IProductState>{
        ...state,
        isLoading: false,
        error: action.error,
      }
  ),
  on(
    ProductActions.importWarehouseProductsAction,
    (state, action) =>
      <IProductState>{
        ...state,
        importLoading: true,
      }
  ),
  on(
    ProductActions.importWarehouseProductsActionSuccess,
    (state, action) =>
      <IProductState>{
        ...state,
        importLoading: false,
        importProductsResult: true,
        importedProducts: action.importedProducts
      }
  ),
  on(
    ProductActions.setImportWarehouseImportProductResultState,
    (state, action) =>
      <IProductState>{
        ...state,
        importProductsResult: action.result,
      }
  ),
  on(
    ProductActions.importWarehouseProductsCancelAction,
    (state, action) =>
      <IProductState>{
        ...state,
        importLoading: false
      }
  ),
  on(
    ProductActions.importWarehouseProductsActionError,
    (state, action) =>
      <IProductState>{
        ...state,
        importLoading: false,
        error: action.error,
        importProductsResult: false
      }
  ),
  on(
    ProductActions.setUpdateWarehouseProductLoadingState,
    (state, action) =>
      <IProductState>{
        ...state,
        isLoading: action.state,
      }
  ),
  on(
    ProductActions.setUpdateWarehouseImportProductLoadingState,
    (state, action) =>
      <IProductState>{
        ...state,
        importLoading: action.state,
      }
  ),
  on(ProductActions.setSearchWarehouseProductAction, (state, action) => ({
    ...state,
    filterKeyword: action.keyword,
  })),
  on(ProductActions.setFilterProductAction, (state, action) => ({
    ...state,
    supplierId: action.productsFilter.supplierId,
    stockStatus: action.productsFilter.stockStatus,
    priceStatus: action.productsFilter.priceStatus,
    activeStatus: action.productsFilter.activeStatus,
  })),
  on(ProductActions.resetWarehouseProductState, (state, action) =>
  (<IProductState>{
    ...initialState,
    filterKeyword: state.filterKeyword,
    supplierId: state.supplierId,
    stockStatus: state.stockStatus,
    priceStatus: state.priceStatus,
    activeStatus: state.activeStatus
  })),
);
