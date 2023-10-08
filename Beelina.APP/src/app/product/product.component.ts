import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AddToCartProductComponent } from './add-to-cart-product/add-to-cart-product.component';
import { TextOrderComponent } from './text-order/text-order.component';

import { DialogService } from '../shared/ui/dialog/dialog.service';
import { ProductService } from '../_services/product.service';
import { StorageService } from '../_services/storage.service';

import { ButtonOptions } from '../_enum/button-options.enum';

import { AppStateInterface } from '../_interfaces/app-state.interface';

import * as ProductActions from './store/actions';
import * as ProductTransactionActions from './add-to-cart-product/store/actions';

import { isLoadingSelector } from './store/selectors';
import { productTransactionsSelector } from './add-to-cart-product/store/selectors';
import { ProductTransaction } from '../_models/transaction';

import { ProductDataSource } from '../_models/datasources/product.datasource';
import { BaseComponent } from '../shared/components/base-component/base.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  private _dataSource: ProductDataSource;
  private _searchForm: FormGroup;
  private _itemCounter: number;
  private _productTransactions: Array<ProductTransaction>;
  private _transactionId: number;
  private _subscription: Subscription = new Subscription();

  $isLoading: Observable<boolean>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private bottomSheet: MatBottomSheet,
    private productService: ProductService,
    private router: Router,
    private store: Store<AppStateInterface>,
    private snackBarService: MatSnackBar,
    private storageService: StorageService,
    private translateService: TranslateService
  ) {
    super();
    this._transactionId =
      +this.activatedRoute.snapshot.paramMap.get('transactionId');

    this.store.dispatch(ProductActions.resetProductState());
    this.store.dispatch(
      ProductTransactionActions.initializeProductTransactions()
    );

    this._dataSource = new ProductDataSource(this.store);

    this._searchForm = this.formBuilder.group({
      filterKeyword: [''],
    });

    this.$isLoading = this.store.pipe(select(isLoadingSelector));

    this._subscription.add(
      this.store
        .pipe(select(productTransactionsSelector))
        .subscribe((productTransactions: Array<ProductTransaction>) => {
          this._productTransactions = productTransactions;
          this._itemCounter = this._productTransactions.length;

          if (this._transactionId === 0) {
            this.storageService.storeString(
              'productTransactions',
              JSON.stringify(this._productTransactions)
            );
          }
        })
    );
  }

  ngOnInit() {}

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

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

  addItemToCart(productId: number) {
    this.bottomSheet.open(AddToCartProductComponent, {
      data: { productId, productTransactions: this._productTransactions },
    });
  }

  openTextOrderDialog() {
    this.bottomSheet.open(TextOrderComponent);
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
