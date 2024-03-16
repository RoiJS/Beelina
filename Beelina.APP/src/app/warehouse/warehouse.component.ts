import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { ProductSourceEnum } from 'src/app/_enum/product-source.enum';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { WarehouseProductDataSource } from 'src/app/_models/datasources/warehouse-product.datasource';
import { Product } from 'src/app/_models/product';
import { AuthService } from 'src/app/_services/auth.service';
import { ProductService } from 'src/app/_services/product.service';
import { AddProductStockQuantityDialogComponent } from 'src/app/product/add-product-stock-quantity-dialog/add-product-stock-quantity-dialog.component';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { SearchFieldComponent } from 'src/app/shared/ui/search-field/search-field.component';
import * as WarehouseProductActions from './store/actions';
import { filterKeywordSelector, isLoadingSelector, totalCountSelector } from './store/selectors';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent extends BaseComponent implements OnInit, AfterViewInit {

  @ViewChild(SearchFieldComponent) searchFieldComponent: SearchFieldComponent;

  private _dataSource: WarehouseProductDataSource;
  private _filterKeyword: string;
  private _selectedProduct: Product;
  private _totalProductCount: number;
  private _dialogRef: MatBottomSheetRef<
    AddProductStockQuantityDialogComponent,
    {
      additionalStockQuantity: number;
      transactionNo: string;
    }
  >;

  private _subscription: Subscription = new Subscription();

  constructor(
    private dialogService: DialogService,
    private bottomSheet: MatBottomSheet,
    private productService: ProductService,
    private store: Store<AppStateInterface>,
    private router: Router,
    private notificationService: NotificationService,
    private translateService: TranslateService
  ) {
    super();

    this.store.dispatch(WarehouseProductActions.resetWarehouseProductState());

    this.$isLoading = this.store.pipe(select(isLoadingSelector));

    this._dataSource = new WarehouseProductDataSource(this.store);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this._subscription.add(
      this.store.pipe(select(filterKeywordSelector))
        .subscribe((filterKeyword: string) => {
          this._filterKeyword = filterKeyword;
          this.searchFieldComponent.value(filterKeyword)
        })
    );

    this._subscription.add(
      this.store.pipe(select(totalCountSelector))
        .subscribe((totalCount: number) => {
          this._totalProductCount = totalCount;
        })
    );
  }

  onSearch(filterKeyword: string) {
    this.store.dispatch(WarehouseProductActions.resetWarehouseProductState());
    this.store.dispatch(
      WarehouseProductActions.setSearchWarehouseProductAction({ keyword: filterKeyword })
    );
    this.store.dispatch(WarehouseProductActions.getWarehouseProductsAction());
  }

  editProduct(id: number) {
    this.router.navigate([`product-catalogue/edit-product/${id}`], { state: { productSource: ProductSourceEnum.Warehouse } });
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
              this.notificationService.openSuccessNotification(this.translateService.instant(
                'PRODUCTS_CATALOGUE_PAGE.DELETE_PRODUCT_DIALOG.SUCCESS_MESSAGE'
              ));
              this.store.dispatch(WarehouseProductActions.resetWarehouseProductState());
              this.store.dispatch(WarehouseProductActions.getWarehouseProductsAction());
            },

            error: () => {
              this.notificationService.openErrorNotification(this.translateService.instant(
                'PRODUCTS_CATALOGUE_PAGE.DELETE_PRODUCT_DIALOG.ERROR_MESSAGE'
              ));
            },
          });
        }
      });
  }

  addProductStockQuantity(product: Product) {
    this._selectedProduct = product;
    this._dialogRef = this.bottomSheet.open(AddProductStockQuantityDialogComponent, {
      data: {
        additionalStockQuantity: 0,
        transactionNo: '',
        productSource: ProductSourceEnum.Warehouse
      },
    });

    this._dialogRef
      .afterDismissed()
      .subscribe(
        (data: {
          additionalStockQuantity: number;
          transactionNo: string;
        }) => {
          if (!data || data.additionalStockQuantity === 0) return;

          this.dialogService.openConfirmation(
            this.translateService.instant(
              'PRODUCTS_CATALOGUE_PAGE.ADD_PRODUCT_STOCK_QUANTITY_DIALOG.TITLE',
            ),
            this.translateService.instant(
              'PRODUCTS_CATALOGUE_PAGE.ADD_PRODUCT_STOCK_QUANTITY_DIALOG.CONFIRM',
            )
          ).subscribe((result: ButtonOptions) => {
            if (result === ButtonOptions.YES) {

              this.store.dispatch(
                WarehouseProductActions.setUpdateWarehouseProductLoadingState({
                  state: true,
                })
              );

              const product = new Product();
              product.id = this._selectedProduct.id;
              product.name = this._selectedProduct.name;
              product.code = this._selectedProduct.code;
              product.description = this._selectedProduct.description;
              product.stockQuantity = data.additionalStockQuantity;
              product.withdrawalSlipNo = data.transactionNo;
              product.isTransferable = this._selectedProduct.isTransferable;
              product.numberOfUnits = this._selectedProduct.numberOfUnits;
              product.pricePerUnit = this._selectedProduct.pricePerUnit;
              product.productUnit.name = this._selectedProduct.productUnit.name;

              this.productService.updateWarehouseProductInformation([product]).subscribe({
                next: () => {
                  this.notificationService.openSuccessNotification(this.translateService.instant(
                    'PRODUCTS_CATALOGUE_PAGE.ADD_PRODUCT_STOCK_QUANTITY_DIALOG.SUCCESS_MESSAGE'
                  ));
                  this.store.dispatch(
                    WarehouseProductActions.setUpdateWarehouseProductLoadingState({
                      state: false,
                    })
                  );

                  this.store.dispatch(WarehouseProductActions.resetWarehouseProductState());
                  this.store.dispatch(WarehouseProductActions.setSearchWarehouseProductAction({ keyword: this.searchFieldComponent.value() }));
                  this.store.dispatch(WarehouseProductActions.getWarehouseProductsAction());
                },

                error: () => {
                  this.notificationService.openErrorNotification(this.translateService.instant(
                    'PRODUCTS_CATALOGUE_PAGE.ADD_PRODUCT_STOCK_QUANTITY_DIALOG.ERROR_MESSAGE'
                  ));

                  this.store.dispatch(
                    WarehouseProductActions.setUpdateWarehouseProductLoadingState({
                      state: false,
                    })
                  );
                },
              })
            }
          })
        }
      );
  }

  addProduct() {
    this.router.navigate(['product-catalogue/add-product'], { state: { productSource: ProductSourceEnum.Warehouse } });
  }

  get dataSource(): WarehouseProductDataSource {
    return this._dataSource;
  }

  get filterKeyword(): string {
    return this._filterKeyword;
  }

  get totalProducts(): number {
    return this._totalProductCount;
  }
}
