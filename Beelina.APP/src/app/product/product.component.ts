import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BaseDataSource } from '../customer/customer.component';
import { AddToCartProductComponent } from './add-to-cart-product/add-to-cart-product.component';

import { DialogService } from '../shared/ui/dialog/dialog.service';
import { Product, ProductService } from '../_services/product.service';
import { ProductTransaction } from '../_services/transaction.service';

import { ButtonOptions } from '../_enum/button-options.enum';

import { AppStateInterface } from '../_interfaces/app-state.interface';

import * as ProductActions from './store/actions';
import { isLoadingSelector, productsSelector } from './store/selectors';
import { productTransactionsSelector } from './add-to-cart-product/store/selectors';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
  private _dataSource: ProductDataSource;
  private _searchForm: FormGroup;
  private _itemCounter: number;

  $isLoading: Observable<boolean>;

  constructor(
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private bottomSheet: MatBottomSheet,
    private productService: ProductService,
    private router: Router,
    private store: Store<AppStateInterface>,
    private snackBarService: MatSnackBar,
    private translateService: TranslateService
  ) {
    this.store.dispatch(ProductActions.resetProductState());
    this._dataSource = new ProductDataSource(this.store);

    this._searchForm = this.formBuilder.group({
      filterKeyword: [''],
    });

    this.$isLoading = this.store.pipe(select(isLoadingSelector));

    this.store
      .pipe(select(productTransactionsSelector))
      .subscribe((productTransactions: Array<ProductTransaction>) => {
        this._itemCounter = productTransactions.length;
      });
  }

  ngOnInit() {}

  goToCart() {
    this.router.navigate([`product-catalogue/product-cart`]);
  }

  editProduct(id: number) {
    this.router.navigate([`product-catalogue/edit-product/${id}`]);
  }

  deleteProduct(id: number) {
    this.dialogService
      .openConfirmation(
        this.translateService.instant(
          'PRODUCTS_CATALOGUE_PAGE.DELETE_PRODUCT_DIALOG.TITLE'
        ),
        this.translateService.instant(
          'PRODUCTS_CATALOGUE_PAGE.DELETE_PRODUCT_DIALOG.CONFIRM'
        )
      )
      .subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this.productService.deleteProduct(id).subscribe({
            next: () => {
              this.snackBarService.open(
                this.translateService.instant(
                  'PRODUCTS_CATALOGUE_PAGE.DELETE_PRODUCT_DIALOG.SUCCESS_MESSAGE'
                ),
                this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                {
                  duration: 5000,
                }
              );
              this.store.dispatch(ProductActions.resetProductState());
              this.store.dispatch(ProductActions.getProductsAction());
            },

            error: () => {
              this.snackBarService.open(
                this.translateService.instant(
                  'PRODUCTS_CATALOGUE_PAGE.DELETE_PRODUCT_DIALOG.ERROR_MESSAGE'
                ),
                this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                {
                  duration: 5000,
                }
              );
            },
          });
        }
      });
  }

  addProduct() {
    this.router.navigate(['product-catalogue/add-product']);
  }

  addItemToCart(id: number) {
    this.bottomSheet.open(AddToCartProductComponent, {
      data: { id },
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

  get itemCounter(): number {
    return this._itemCounter;
  }

  get searchForm(): FormGroup {
    return this._searchForm;
  }

  get dataSource(): ProductDataSource {
    return this._dataSource;
  }
}

export class ProductDataSource extends BaseDataSource<Product> {
  constructor(override store: Store<AppStateInterface>) {
    super(store);

    this.store.dispatch(ProductActions.getProductsAction());

    this._subscription.add(
      this.store
        .pipe(select(productsSelector))
        .subscribe((products: Array<Product>) => {
          this._dataStream.next(products);
        })
    );
  }

  override fetchData() {
    this.store.dispatch(ProductActions.getProductsAction());
  }
}
