import { createReducer, on } from '@ngrx/store';
import { Product } from 'src/app/_models/product';

import { IProductState } from '../types/product-state.interface';

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
    ProductActions.getProductsAction,
    (state, action) =>
      <IProductState>{
        ...state,
        isLoading: (state.endCursor === null),
      }
  ),
  on(
    ProductActions.getProductsActionSuccess,
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
    ProductActions.analyzeTextInventories,
    (state, action) =>
      <IProductState>{
        ...state,
        isLoading: true,
      }
  ),
  on(
    ProductActions.analyzeTextInventoriesActionSuccess,
    (state, action) =>
      <IProductState>{
        ...state,
        isLoading: false,
        textProductInventories: state.textProductInventories.concat(action.textProductInventories),
      }
  ),
  on(
    ProductActions.getProductsActionError,
    (state, action) =>
      <IProductState>{
        ...state,
        isLoading: false,
        error: action.error,
      }
  ),
  on(
    ProductActions.setUpdateProductLoadingState,
    (state, action) =>
      <IProductState>{
        ...state,
        isUpdateLoading: action.state,
      }
  ),
  on(ProductActions.setSearchProductAction, (state, action) => ({
    ...state,
    filterKeyword: action.keyword,
  })),
  on(ProductActions.setFilterProductAction, (state, action) => ({
    ...state,
    supplierId: action.productsFilter.supplierId,
    stockStatus: action.productsFilter.stockStatus,
    priceStatus: action.productsFilter.priceStatus,
    activeStatus: action.productsFilter.activeStatus
  })),
  on(ProductActions.resetProductState, (state, action) =>
  (<IProductState>{
    ...initialState,
    filterKeyword: state.filterKeyword,
    supplierId: state.supplierId,
    stockStatus: state.stockStatus,
    priceStatus: state.priceStatus,
    activeStatus: state.activeStatus
  })),
  on(ProductActions.resetTextInventoriesState, (state, action) => ({
    ...state,
    textProductInventories: initialState.textProductInventories,
  })),
  on(ProductActions.setProductDeductionAction, (state, action) => {
    const productIdx = state.products.findIndex(
      (p) => p.id === action.productId
    );

    if (productIdx < 0) return state;

    const product = state.products[productIdx];
    const updatedProduct = new Product();
    updatedProduct.id = product.id;
    updatedProduct.name = product.name;
    updatedProduct.description = product.description;
    updatedProduct.stockQuantity = product.stockQuantity;
    updatedProduct.pricePerUnit = product.pricePerUnit;
    updatedProduct.price = product.price;
    updatedProduct.productUnit = product.productUnit;
    updatedProduct.validFrom = product.validFrom;
    updatedProduct.validTo = product.validTo;
    updatedProduct.parent = product.parent;
    updatedProduct.productParentGroupId = product.productParentGroupId;
    updatedProduct.deductedStock = -action.deduction;

    const updatedProducts = [...state.products];
    updatedProducts[productIdx] = updatedProduct;

    return {
      ...state,
      products: updatedProducts,
    };
  })
);
