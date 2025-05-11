import { Component, inject, OnDestroy, OnInit, output } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { ProductDataSource } from 'src/app/_models/datasources/product.datasource';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

import * as ProductActions from '../../../product/store/actions';

import { filterKeywordSelector, isLoadingSelector, totalCountSelector } from 'src/app/product/store/selectors';
import { ProductService } from 'src/app/_services/product.service';
import { NumberFormatter } from 'src/app/_helpers/formatters/number-formatter.helper';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent extends BaseComponent implements OnInit, OnDestroy {

  selectItem = output<number>();

  private _productDataSource: ProductDataSource;
  private _filterKeyword: string;
  private _totalProductCount: number;
  private _subscription: Subscription = new Subscription();
  private _totalProductValue: string;
  private _totalProductValueSubscription: Subscription;

  private store = inject(Store<AppStateInterface>);
  private productService = inject(ProductService);

  constructor() {
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
    if (this._totalProductValueSubscription) this._totalProductValueSubscription.unsubscribe();
    this.resetProductList();
  }

  resetProductList() {
    this.store.dispatch(ProductActions.resetProductState());
  }

  initProductList() {
    this.resetProductList();
    this.calculateTotalInventoryValue();
    this._productDataSource = new ProductDataSource(this.store);
  }

  searchProduct(filterKeyword: string) {
    this.store.dispatch(ProductActions.resetProductState());
    this.store.dispatch(
      ProductActions.setSearchProductAction({ keyword: filterKeyword })
    );
    this.store.dispatch(ProductActions.getProductsAction());
  }

  onClear() {
    this.searchProduct('');
  }

  calculateTotalInventoryValue() {
    this._totalProductValueSubscription = this.productService.getPanelInventoryTotalValue().subscribe({
      next: (data: number) => {
        this._totalProductValue = NumberFormatter.formatCurrency(data);
      },
    })
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

  get totalProductValue(): string {
    return this._totalProductValue;
  }
}
