import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { ProductDataSource } from 'src/app/_models/datasources/product.datasource';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

import * as ProductActions from '../../../product/store/actions';

import { filterKeywordSelector, isLoadingSelector, totalCountSelector } from 'src/app/product/store/selectors';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent extends BaseComponent implements OnInit, OnDestroy {

  @Output() selectItem = new EventEmitter<number>();
  private _productDataSource: ProductDataSource;
  private _filterKeyword: string;
  private _totalProductCount: number;
  private _subscription: Subscription = new Subscription();

  constructor(
    private store: Store<AppStateInterface>,
  ) {
    super();
    this.store.dispatch(ProductActions.resetProductState());
    this.$isLoading = this.store.pipe(select(isLoadingSelector));
  }

  ngOnInit() {
    this._subscription.add(
      this.store.pipe(select(filterKeywordSelector))
        .subscribe((filterKeyword: string) => {
          this._filterKeyword = filterKeyword;
        })
    );

    this._subscription.add(
      this.store.pipe(select(totalCountSelector))
        .subscribe((totalCount: number) => {
          this._totalProductCount = totalCount;
        })
    );
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
    this.resetProductList();
  }

  resetProductList() {
    this.store.dispatch(ProductActions.resetProductState());
  }

  initProductList() {
    this.resetProductList();
    this._productDataSource = new ProductDataSource(this.store);
  }

  searchProduct(filterKeyword: string) {
    this.store.dispatch(ProductActions.resetProductState());
    this.store.dispatch(
      ProductActions.setSearchProductAction({ keyword: filterKeyword })
    );
    this.store.dispatch(ProductActions.getProductsAction());
  }

  selectItemEvent(id: number) {
    this.selectItem.emit(id);
  }

  get productDataSource(): ProductDataSource {
    return this._productDataSource;
  }

  get filterKeyword(): string {
    return this._filterKeyword;
  }

  get totalProducts(): number {
    return this._totalProductCount;
  }
}
