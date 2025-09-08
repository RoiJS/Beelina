import { AfterViewInit, Component, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { Router } from '@angular/router';
import { Subscription, combineLatest, firstValueFrom, take } from 'rxjs';

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
import { CopyProductConfirmationComponent } from '../product/copy-product-confirmation/copy-product-confirmation.component';

import { ApplySubscriptionService } from '../_services/apply-subscription.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { LocalClientSubscriptionDbService } from '../_services/local-db/local-client-subscription-db.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { ProductService } from 'src/app/_services/product.service';
import * as WarehouseProductActions from './store/actions';
import { activeStatusSelector, filterKeywordSelector, isLoadingSelector, priceStatusSelector, stockStatusSelector, supplierIdSelector, totalCountSelector } from './store/selectors';
import { ProductsFilter } from '../_models/filters/products.filter';
import { ClientSubscriptionDetails } from '../_models/client-subscription-details.model';
import { StockStatusEnum } from '../_enum/stock-status.enum';
import { PriceStatusEnum } from '../_enum/price-status.enum';
import { ProductActiveStatusEnum } from '../_enum/product-active-status.enum';

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
      stockStatus: StockStatusEnum;
      priceStatus: PriceStatusEnum;
    }
  >;

  private _copyProductConfirmationRef: MatBottomSheetRef<
    CopyProductConfirmationComponent,
    {
      confirm: boolean;
      setValidToDate: boolean;
    }
  >;

  clientSubscriptionDetails: ClientSubscriptionDetails;

  applySubscriptionService = inject(ApplySubscriptionService);
  localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService);
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
    this.applySubscriptionService.setBottomSheet(this.bottomSheet);
  }

  async ngOnInit() {
    this.clientSubscriptionDetails = await this.localClientSubscriptionDbService.getLocalClientSubsription();
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
    this.store.dispatch(WarehouseProductActions.getWarehouseProductsCancelAction());
    this._dialogAddQuantityRef = null;
    this._transferInventoryDialogRef = null;
    this._dialogOpenFilterRef = null;
    this._copyProductConfirmationRef = null;
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
          this._subscription.add(
            combineLatest([
              this.store.select(supplierIdSelector),
              this.store.select(stockStatusSelector),
              this.store.select(priceStatusSelector),
              this.store.select(activeStatusSelector)
            ]).pipe(take(1))
              .subscribe(([currentSupplierId, currentStockStatus, currentPriceStatus, currentActiveStatus]) => {
                const productsFilter = new ProductsFilter();
                productsFilter.supplierId = currentSupplierId;
                productsFilter.stockStatus = currentStockStatus;
                productsFilter.priceStatus = currentPriceStatus;
                productsFilter.activeStatus = currentActiveStatus;
                this.productsFilter.set(productsFilter);
              })
          );
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
    const defaultProductsFilter = new ProductsFilter();
    defaultProductsFilter.supplierId = 0;
    defaultProductsFilter.stockStatus = StockStatusEnum.All;
    defaultProductsFilter.priceStatus = PriceStatusEnum.All;
    defaultProductsFilter.activeStatus = ProductActiveStatusEnum.ActiveOnly;

    this._dialogOpenFilterRef = this.bottomSheet.open(ProductFilterComponent, {
      data: {
        defaultProductsFilter: defaultProductsFilter,
        currentProductsFilter: this.productsFilter()
      }
    });

    this._dialogOpenFilterRef
      .afterDismissed()
      .subscribe(
        (data: {
          supplierId: number,
          stockStatus: StockStatusEnum,
          priceStatus: PriceStatusEnum,
          activeStatus: ProductActiveStatusEnum
        }) => {
          if (!data) return;

          const productsFilter = new ProductsFilter();
          productsFilter.supplierId = data.supplierId;
          productsFilter.stockStatus = data.stockStatus;
          productsFilter.priceStatus = data.priceStatus;
          productsFilter.activeStatus = data.activeStatus;
          this.productsFilter.set(productsFilter);

          this.store.dispatch(WarehouseProductActions.resetWarehouseProductState());
          this.store.dispatch(WarehouseProductActions.setFilterProductAction({
            productsFilter: this.productsFilter()
          }));
          this.store.dispatch(WarehouseProductActions.getWarehouseProductsAction());
        });
  }

  editProduct(id: number) {
    this.router.navigate([`/app/product-catalogue/edit-product/${id}`], { state: { productSource: ProductSourceEnum.Warehouse } });
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

  addProductStockQuantity() {
    this.router.navigate(['/app/purchase-orders/add']);
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
    if (this.clientSubscriptionDetails.productSKUMax === 0 || this.totalProducts() <= this.clientSubscriptionDetails.productSKUMax) {
      this.router.navigate(['/app/product-catalogue/add-product'], { state: { productSource: ProductSourceEnum.Warehouse } });
    } else {
      this.applySubscriptionService.open(this.translateService.instant("SUBSCRIPTION_TEXTS.PRODUCT_REGISTRATION_LIMIT_ERROR", { productSKUMax: this.clientSubscriptionDetails.productSKUMax }));
    }
  }

  async copyProductItem(product: Product) {
    this.selectedProduct.set(product);

    const copyProduct = new Product();
    const copyOfText = this.translateService.instant("GENERAL_TEXTS.COPY_OF");

    let latestProductCode: string | null = null;
    try {
      latestProductCode = await firstValueFrom(this.productService.getLatestProductCode());
    } catch (error) {
      console.error('Failed to get latest product code:', error);
      // Continue with fallback approach
    }
    copyProduct.id = 0;
    copyProduct.name = copyOfText + ' ' + this.selectedProduct().name;

    // Use latest product code if available, otherwise use copy of existing code
    if (latestProductCode) {
      // Increment the latest code (assuming numeric suffix)
      const incrementedCode = this.incrementCode(latestProductCode);
      copyProduct.code = incrementedCode;
    } else {
      copyProduct.code = copyOfText + ' ' + this.selectedProduct().code;
    }

    copyProduct.description = this.selectedProduct().description;
    copyProduct.stockQuantity = 0;
    copyProduct.isTransferable = this.selectedProduct().isTransferable;
    copyProduct.numberOfUnits = this.selectedProduct().numberOfUnits;
    copyProduct.pricePerUnit = this.selectedProduct().pricePerUnit;
    copyProduct.supplierId = this.selectedProduct().supplierId;
    copyProduct.validFrom = new Date();
    copyProduct.validTo = null;
    copyProduct.productUnit.name = this.selectedProduct().productUnit.name;

    // Handle product parent group assignment
    if (this.selectedProduct().parent) {
      // If the original product is a parent, assign it as the parent group
      copyProduct.productParentGroupId = this.selectedProduct().id;
      copyProduct.parent = false; // The copy is not a parent itself
    } else {
      // If the original product is not a parent, copy its parent group id
      copyProduct.productParentGroupId = this.selectedProduct().productParentGroupId;
      copyProduct.parent = false; // The copy is not a parent itself
    }

    // Handle valid dates for products with same product group id
    const currentDate = new Date();
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1);

    // Set the copy's valid from date to current date
    copyProduct.validFrom = currentDate;
    copyProduct.validTo = null;

    // Open the copy product confirmation dialog
    this._copyProductConfirmationRef = this.bottomSheet.open(CopyProductConfirmationComponent, {
      data: {
        productName: copyProduct.name,
      },
    });

    this._copyProductConfirmationRef.afterDismissed().subscribe((result) => {
      if (result?.confirm) {
        // If user confirmed and wants to set validTo date on original product
        if (result.setValidToDate) {

          // Create a proper Product instance for the original
          const originalProduct = new Product();
          Object.assign(originalProduct, this.selectedProduct());
          originalProduct.validTo = previousDay;

          // Update the original product first
          this.productService.updateWarehouseProductInformation([originalProduct]).subscribe({
            next: () => {
              // Then proceed with creating the copy
              this.proceedWithWarehouseProductCopy(copyProduct);
            },
            error: () => {
              this.notificationService.openErrorNotification(
                this.translateService.instant(
                  'PRODUCTS_CATALOGUE_PAGE.COPY_PRODUCT_DIALOG.ERROR_MESSAGE'
                )
              );
            }
          });
        } else {
          // If no validTo date setting needed, proceed directly with copy creation
          this.proceedWithWarehouseProductCopy(copyProduct);
        }
      }
    });
  }

  private proceedWithWarehouseProductCopy(copyProduct: Product) {
    this.productService.updateWarehouseProductInformation([copyProduct]).subscribe({
      next: () => {
        this.notificationService.openSuccessNotification(
          this.translateService.instant(
            'PRODUCTS_CATALOGUE_PAGE.COPY_PRODUCT_DIALOG.SUCCESS_MESSAGE'
          )
        );
        this.store.dispatch(WarehouseProductActions.resetWarehouseProductState());
        this.store.dispatch(WarehouseProductActions.getWarehouseProductsAction());
      },
      error: () => {
        this.notificationService.openErrorNotification(
          this.translateService.instant(
            'PRODUCTS_CATALOGUE_PAGE.COPY_PRODUCT_DIALOG.ERROR_MESSAGE'
          )
        );
      },
    });
  }


  productImport() {
    this.router.navigate(['/app/warehouse-products/product-import'], { state: { productSource: ProductSourceEnum.Warehouse } });
  }

  get dataSource(): WarehouseProductDataSource {
    return this._dataSource;
  }
}
