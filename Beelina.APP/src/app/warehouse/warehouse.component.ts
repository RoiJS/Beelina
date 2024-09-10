import { AfterViewInit, Component, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
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

import { AddProductStockQuantityDialogComponent } from 'src/app/product/add-product-stock-quantity-dialog/add-product-stock-quantity-dialog.component';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { ProductFilterComponent } from '../product/product-filter/product-filter.component';
import { SearchFieldComponent } from 'src/app/shared/ui/search-field/search-field.component';
import { TransferProductInventoryComponent } from '../product/transfer-product-inventory/transfer-product-inventory.component';

import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { ProductService } from 'src/app/_services/product.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import * as WarehouseProductActions from './store/actions';
import { filterKeywordSelector, isLoadingSelector, supplierIdSelector, totalCountSelector } from './store/selectors';
import { ProductsFilter } from '../_models/filters/products.filter';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {

  searchFieldComponent = viewChild(SearchFieldComponent);

  filterKeyword = signal<string>('');
  productsFilter = signal<ProductsFilter>(new ProductsFilter());
  selectedProduct = signal<Product>(null);
  totalProducts = signal<number>(0);

  private _subscription: Subscription = new Subscription();
  private _transferInventoryDialogRef: MatBottomSheetRef<TransferProductInventoryComponent>;
  private _dataSource: WarehouseProductDataSource;
  private _dialogAddQuantityRef: MatBottomSheetRef<
    AddProductStockQuantityDialogComponent,
    {
      additionalStockQuantity: number;
      transactionNo: string;
    }
  >;

  private _dialogOpenFilterRef: MatBottomSheetRef<
    ProductFilterComponent,
    {
      supplierId: number;
    }
  >;

  dialogService = inject(DialogService);
  bottomSheet = inject(MatBottomSheet);
  productService = inject(ProductService);
  store = inject(Store<AppStateInterface>);
  router = inject(Router);
  notificationService = inject(NotificationService);
  translateService = inject(TranslateService);

  constructor() {
    super();

    this.store.dispatch(WarehouseProductActions.resetWarehouseProductState());
    this.$isLoading = this.store.pipe(select(isLoadingSelector));
    this._dataSource = new WarehouseProductDataSource(this.store);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
    this.store.dispatch(WarehouseProductActions.getWarehouseProductsCancelAction());
    this._dialogAddQuantityRef = null;
    this._transferInventoryDialogRef = null;
    this._dialogOpenFilterRef = null;
  }

  ngAfterViewInit() {
    this._subscription.add(
      this.store.pipe(select(filterKeywordSelector))
        .subscribe((filterKeyword: string) => {
          this.filterKeyword.set(filterKeyword);
          this.searchFieldComponent().value(filterKeyword)
        })
    );

    this._subscription.add(
      this.store.pipe(select(supplierIdSelector))
        .subscribe((supplierId: number) => {
          const productsFilter = new ProductsFilter();
          productsFilter.supplierId = supplierId;
          this.productsFilter.set(productsFilter);
        })
    );

    this._subscription.add(
      this.store.pipe(select(totalCountSelector))
        .subscribe((totalCount: number) => {
          this.totalProducts.set(totalCount);
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

  onClear() {
    this.onSearch('');
  }

  openFilter() {
    this._dialogOpenFilterRef = this.bottomSheet.open(ProductFilterComponent, {
      data: this.productsFilter()
    });

    this._dialogOpenFilterRef
      .afterDismissed()
      .subscribe(
        (data: {
          supplierId: number
        }) => {
          if (!data) return;

          this.productsFilter().supplierId = data.supplierId;
          this.store.dispatch(WarehouseProductActions.resetWarehouseProductState());
          this.store.dispatch(WarehouseProductActions.setFilterProductAction({
            productsFilter: this.productsFilter()
          }));
          this.store.dispatch(WarehouseProductActions.getWarehouseProductsAction());
        });
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
    this.selectedProduct.set(product);
    this._dialogAddQuantityRef = this.bottomSheet.open(AddProductStockQuantityDialogComponent, {
      data: {
        additionalStockQuantity: 0,
        transactionNo: '',
        productSource: ProductSourceEnum.Warehouse
      },
    });

    this._dialogAddQuantityRef
      .afterDismissed()
      .subscribe(
        (data: {
          additionalStockQuantity: number;
          transactionNo: string;
          plateNo: string;
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
              product.id = this.selectedProduct().id;
              product.name = this.selectedProduct().name;
              product.code = this.selectedProduct().code;
              product.description = this.selectedProduct().description;
              product.stockQuantity = data.additionalStockQuantity;
              product.withdrawalSlipNo = data.transactionNo;
              product.plateNo = data.plateNo;
              product.isTransferable = this.selectedProduct().isTransferable;
              product.numberOfUnits = this.selectedProduct().numberOfUnits;
              product.supplierId = this.selectedProduct().supplierId;
              product.pricePerUnit = this.selectedProduct().pricePerUnit;
              product.productUnit.name = this.selectedProduct().productUnit.name;

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
                  this.store.dispatch(WarehouseProductActions.setSearchWarehouseProductAction({ keyword: this.searchFieldComponent().value() }));
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

  transferProductInventory(productId: number) {
    this._transferInventoryDialogRef = this.bottomSheet.open(TransferProductInventoryComponent, {
      data: { productId, productSource: ProductSourceEnum.Warehouse },
    });
    this._transferInventoryDialogRef.afterDismissed().subscribe((result: boolean) => {
      if (result) {
        this.store.dispatch(WarehouseProductActions.resetWarehouseProductState());
        this.store.dispatch(WarehouseProductActions.setSearchWarehouseProductAction({ keyword: this.searchFieldComponent().value() }));
        this.store.dispatch(WarehouseProductActions.getWarehouseProductsAction());
      }
    })
  }

  addProduct() {
    this.router.navigate(['product-catalogue/add-product'], { state: { productSource: ProductSourceEnum.Warehouse } });
  }
  productImport() {
    this.router.navigate(['warehouse-products/product-import'], { state: { productSource: ProductSourceEnum.Warehouse } });
  }

  get dataSource(): WarehouseProductDataSource {
    return this._dataSource;
  }
}
