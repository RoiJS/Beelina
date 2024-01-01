import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { ProductTransaction } from 'src/app/_models/transaction';
import * as ProductActions from '../../store/actions';
import { isLoadingSelector } from '../../store/selectors';

import { ProductDataSource } from 'src/app/_models/datasources/product.datasource';
import { AddToCartProductComponent } from '../../add-to-cart-product/add-to-cart-product.component';

@Component({
  selector: 'app-select-new-product',
  templateUrl: './select-new-product.component.html',
  styleUrls: ['./select-new-product.component.scss'],
})
export class SelectNewProductComponent implements OnInit {
  private _dataSource: ProductDataSource;
  private _productTransactions: Array<ProductTransaction>;

  $isLoading: Observable<boolean>;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<SelectNewProductComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: { productTransactions: Array<ProductTransaction> },
    private bottomSheet: MatBottomSheet,
    private store: Store<AppStateInterface>
  ) {
    this._productTransactions = data.productTransactions;

    this.store.dispatch(ProductActions.resetProductState());
    this._dataSource = new ProductDataSource(this.store);

    this.$isLoading = this.store.pipe(select(isLoadingSelector));
  }

  ngOnInit() {}

  addItemToCart(productId: number) {
    this.bottomSheet.open(AddToCartProductComponent, {
      data: { productId, productTransactions: this._productTransactions },
    });
  }

  onSearch(filterKeyword: string) {
    this.store.dispatch(ProductActions.resetProductState());
    this.store.dispatch(
      ProductActions.setSearchProductAction({ keyword: filterKeyword })
    );
    this.store.dispatch(ProductActions.getProductsAction());
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  get dataSource(): ProductDataSource {
    return this._dataSource;
  }
}
