import { AfterViewInit, Component, inject, OnDestroy, signal, viewChild } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { Store, select } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { ProductTransaction } from 'src/app/_models/transaction';
import * as ProductActions from '../../store/actions';
import { filterKeywordSelector, isLoadingSelector } from '../../store/selectors';

import { ProductDataSource } from 'src/app/_models/datasources/product.datasource';
import { AddToCartProductComponent } from '../../add-to-cart-product/add-to-cart-product.component';
import { ProductsFilter } from 'src/app/_models/filters/products.filter';
import { SearchFieldComponent } from 'src/app/shared/ui/search-field/search-field.component';

@Component({
  selector: 'app-select-new-product',
  templateUrl: './select-new-product.component.html',
  styleUrls: ['./select-new-product.component.scss'],
})
export class SelectNewProductComponent implements AfterViewInit, OnDestroy {
  private _dataSource: ProductDataSource;
  private _productTransactions: Array<ProductTransaction>;

  private _bottomSheet = inject(MatBottomSheet);
  private _bottomSheetRef = inject(MatBottomSheetRef<SelectNewProductComponent>);
  private _store = inject(Store<AppStateInterface>);

  _subscription: Subscription = new Subscription();

  filterKeyword = signal<string>('');

  $isLoading: Observable<boolean>;

  data = inject<{ productTransactions: Array<ProductTransaction> }>(MAT_BOTTOM_SHEET_DATA);
  store = inject(Store<AppStateInterface>);

  searchFieldComponent = viewChild(SearchFieldComponent);

  constructor() {
    this._productTransactions = this.data.productTransactions;

    this._store.dispatch(ProductActions.resetProductState());
    this._store.dispatch(ProductActions.setSearchProductAction({ keyword: '' }));
    this._store.dispatch(ProductActions.setFilterProductAction({ productsFilter: new ProductsFilter() }));
    this._dataSource = new ProductDataSource(this._store);

    this.$isLoading = this._store.pipe(select(isLoadingSelector));
  }

  ngAfterViewInit() {
    this._subscription.add(
      this.store.pipe(select(filterKeywordSelector))
        .subscribe((filterKeyword: string) => {
          this.filterKeyword.set(filterKeyword);
          this.searchFieldComponent().value(filterKeyword);
        })
    );
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  addItemToCart(productId: number) {
    this._bottomSheet.open(AddToCartProductComponent, {
      data: { productId, productTransactions: this._productTransactions },
    });
  }

  onSearch(filterKeyword: string) {
    this._store.dispatch(ProductActions.resetProductState());
    this._store.dispatch(
      ProductActions.setSearchProductAction({ keyword: filterKeyword })
    );
    this._store.dispatch(ProductActions.getProductsAction());
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  get dataSource(): ProductDataSource {
    return this._dataSource;
  }
}
