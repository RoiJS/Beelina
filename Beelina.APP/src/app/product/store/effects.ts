import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, from, map, of, switchMap, take, takeUntil, tap } from 'rxjs';
import { Store } from '@ngrx/store';

import {
  activeStatusSelector,
  endCursorSelector as endCursorProductSelector,
  filterKeywordSelector as filterKeywordProductSelector,
  priceStatusSelector,
  stockStatusSelector,
  supplierIdSelector as supplierIdProductSelector,
} from '../../product/store/selectors';

import { productTransactionsSelector } from '../../product/add-to-cart-product/store/selectors';

import { Product } from 'src/app/_models/product';
import { ProductTransaction } from 'src/app/_models/transaction';

import { LocalProductsDbService } from 'src/app/_services/local-db/local-products-db.service';
import { NetworkService } from 'src/app/_services/network.service';
import { ProductService } from 'src/app/_services/product.service';
import { StorageService } from 'src/app/_services/storage.service';

import * as ProductTransactionActions from '../add-to-cart-product/store/actions';
import * as ProductActions from './actions';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { StockStatusEnum } from 'src/app/_enum/stock-status.enum';
import { PriceStatusEnum } from 'src/app/_enum/price-status.enum';
import { ProductActiveStatusEnum } from 'src/app/_enum/product-active-status.enum';
import { ProductsFilter } from 'src/app/_models/filters/products.filter';

@Injectable()
export class ProductEffects {

  private actions$ = inject(Actions);
  private localProductsDbService = inject(LocalProductsDbService);
  private networkService = inject(NetworkService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private storageService = inject(StorageService);
  private store = inject(Store<AppStateInterface>);

  products$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.getProductsAction),
      switchMap(() => {

        let cursor = null,
          filterKeyword = '',
          supplierId = 0,
          stockStatus = StockStatusEnum.All,
          priceStatus = PriceStatusEnum.All,
          activeStatus = ProductActiveStatusEnum.ActiveOnly,
          limit = 50,
          productTransactionItems = Array<ProductTransaction>();

        this.store
          .select(endCursorProductSelector)
          .pipe(take(1))
          .subscribe((currentCursor) => (cursor = currentCursor));

        this.store
          .select(filterKeywordProductSelector)
          .pipe(take(1))
          .subscribe(
            (currentFilterKeyword) => (filterKeyword = currentFilterKeyword)
          );

        this.store
          .select(productTransactionsSelector)
          .pipe(take(1))
          .subscribe(
            (productTransactions) => (productTransactionItems = productTransactions)
          );

        this.store
          .select(supplierIdProductSelector)
          .pipe(take(1))
          .subscribe(
            (currentSupplierId) => (supplierId = currentSupplierId)
          );

        this.store
          .select(stockStatusSelector)
          .pipe(take(1))
          .subscribe(
            (currentStockStatus) => (stockStatus = currentStockStatus)
          );

        this.store
          .select(priceStatusSelector)
          .pipe(take(1))
          .subscribe(
            (currentPriceStatus) => (priceStatus = currentPriceStatus)
          );

        this.store
          .select(activeStatusSelector)
          .pipe(take(1))
          .subscribe(
            (currentActiveStatus) => (activeStatus = currentActiveStatus)
          );

        const productsFilter = new ProductsFilter();
        productsFilter.supplierId = supplierId;
        productsFilter.stockStatus = stockStatus;
        productsFilter.priceStatus = priceStatus;
        productsFilter.activeStatus = activeStatus;

        if (!this.networkService.isOnline.value) {
          return from(this.localProductsDbService.getMyLocalProducts(
            filterKeyword,
            productsFilter,
            limit,
            productTransactionItems
          )).pipe(
            map((data: {
              endCursor: string;
              hasNextPage: boolean;
              totalCount: number;
              products: Array<Product>;
            }) => {
              return ProductActions.getProductsActionSuccess({
                products: data.products,
                endCursor: "dummyEndCursor",
                hasNextPage: data.hasNextPage,
                totalCount: data.totalCount,
              });
            })
          );
        }

        const userAccountId = +this.storageService.getString('currentSalesAgentId');

        return this.productService.getProducts(
          userAccountId,
          cursor,
          filterKeyword,
          productsFilter,
          limit,
          productTransactionItems
        ).pipe(
          map(
            (data: {
              endCursor: string;
              hasNextPage: boolean;
              totalCount: number;
              products: Array<Product>;
            }) => {
              return ProductActions.getProductsActionSuccess({
                products: data.products,
                endCursor: data.endCursor,
                hasNextPage: data.hasNextPage,
                totalCount: data.totalCount,
              });
            }
          ),
          takeUntil(this.actions$.pipe(ofType(ProductActions.getProductsCancelAction))),
          catchError((error) =>
            of(
              ProductActions.getProductsActionError({
                error: error.message,
              })
            )
          )
        );
      })
    )
  );

  analyzeTextOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.analyzeTextOrders),
      switchMap((action: { textOrders: string }) => {

        if (!this.networkService.isOnline.value) {
          return from(this.localProductsDbService.analyzeTextOrder(action.textOrders)).pipe(
            map((productTransactions: Array<ProductTransaction>) => {
              return ProductTransactionActions.initializeProductTransactionsSuccess(
                {
                  productTransactions,
                }
              );
            }),
            tap(() => {
              this.storageService.remove("textOrder");
              this.router.navigate([`/app/product-catalogue/product-cart`]);
            })
          )
        }

        return this.productService.analyzeTextOrders(action.textOrders).pipe(
          map((productTransactions: Array<ProductTransaction>) => {
            return ProductTransactionActions.initializeProductTransactionsSuccess(
              {
                productTransactions,
              }
            );
          }),
          tap(() => {
            this.storageService.remove("textOrder");
            this.router.navigate([`/app/product-catalogue/product-cart`]);
          }),
          catchError((error) =>
            of(
              ProductActions.getProductsActionError({
                error: error.message,
              })
            )
          )
        );
      })
    )
  );

  analyzeTextInventories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.analyzeTextInventories),
      switchMap((action: { textInventories: string }) => {
        return this.productService.analyzeTextInventories(action.textInventories).pipe(
          map((textProductInventories: Array<Product>) => {
            return ProductActions.analyzeTextInventoriesActionSuccess(
              {
                textProductInventories,
              }
            );
          }),
          catchError((error) =>
            of(
              ProductActions.getProductsActionError({
                error: error.message,
              })
            )
          )
        );
      })
    )
  );
}
