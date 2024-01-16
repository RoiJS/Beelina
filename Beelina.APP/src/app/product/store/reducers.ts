import { createReducer, on } from '@ngrx/store';
import { mutableOn } from 'ngrx-etc';
import { Product } from 'src/app/_models/product';

import { IProductState } from '../types/product-state.interface';

import * as ProductActions from './actions';

export const initialState: IProductState = {
  isLoading: false,
  isUpdateLoading: false,
  products: new Array<Product>(),
  textProductInventories: new Array<Product>(),
  endCursor: null,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
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
        isLoading: action.state,
      }
  ),
  on(ProductActions.setSearchProductAction, (state, action) => ({
    ...state,
    filterKeyword: action.keyword,
  })),
  on(ProductActions.resetProductState, (state, action) =>
  (<IProductState>{
    ...initialState,
    filterKeyword: state.filterKeyword
  })),
  on(ProductActions.resetTextInventoriesState, (state, action) => ({
    ...state,
    textProductInventories: initialState.textProductInventories,
  })),
  mutableOn(ProductActions.setProductDeductionAction, (state, action) => {
    const productIdx = state.products.findIndex(
      (p) => p.id === action.productId
    );
    const product = state.products[productIdx];
    const updatedProduct = new Product();
    updatedProduct.id = product.id;
    updatedProduct.name = product.name;
    updatedProduct.description = product.description;
    updatedProduct.stockQuantity = product.stockQuantity;
    updatedProduct.pricePerUnit = product.pricePerUnit;
    updatedProduct.price = product.price;
    updatedProduct.productUnit = product.productUnit;
    updatedProduct.deductedStock = -action.deduction;

    state.products[productIdx] = updatedProduct;
  })
);
