import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import * as ProductActions from '../../store/actions';
import { isLoadingSelector } from '../../store/selectors';
import { ProductTransaction } from 'src/app/_models/transaction';

import { ProductDataSource } from '../../product.component';
import { AddToCartProductComponent } from '../../add-to-cart-product/add-to-cart-product.component';

@Component({
  selector: 'app-select-new-product',
  templateUrl: './select-new-product.component.html',
  styleUrls: ['./select-new-product.component.scss'],
})
export class SelectNewProductComponent implements OnInit {
  private _dataSource: ProductDataSource;
  private _productTransactions: Array<ProductTransaction>;
  private _searchForm: FormGroup;

  $isLoading: Observable<boolean>;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<SelectNewProductComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: { productTransactions: Array<ProductTransaction> },
    private bottomSheet: MatBottomSheet,
    private formBuilder: FormBuilder,
    private store: Store<AppStateInterface>,
  ) {
    this._productTransactions = data.productTransactions;

    this.store.dispatch(ProductActions.resetProductState());
    this._dataSource = new ProductDataSource(this.store);

    this._searchForm = this.formBuilder.group({
      filterKeyword: [''],
    });

    this.$isLoading = this.store.pipe(select(isLoadingSelector));
  }

  ngOnInit() {}

  addItemToCart(productId: number) {
    this.bottomSheet.open(AddToCartProductComponent, {
      data: { productId, productTransactions: this._productTransactions },
    });
  }

  onSearch() {
    const filterKeyword = this._searchForm.get('filterKeyword').value;
    this.store.dispatch(ProductActions.resetProductState());
    this.store.dispatch(
      ProductActions.setSearchProductAction({ keyword: filterKeyword })
    );
    this.store.dispatch(ProductActions.getProductsAction());
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  get searchForm(): FormGroup {
    return this._searchForm;
  }

  get dataSource(): ProductDataSource {
    return this._dataSource;
  }
}
