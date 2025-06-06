import { AfterViewInit, Component, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';

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

import { ApplySubscriptionService } from '../_services/apply-subscription.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { LocalClientSubscriptionDbService } from '../_services/local-db/local-client-subscription-db.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { ProductService } from 'src/app/_services/product.service';
import * as WarehouseProductActions from './store/actions';
import { filterKeywordSelector, isLoadingSelector, supplierIdSelector, totalCountSelector } from './store/selectors';
import { ProductsFilter } from '../_models/filters/products.filter';
import { ProductWarehouseStockReceiptEntry } from '../_models/product-warehouse-stock-receipt-entry';
import { ProductStockWarehouseAudit } from '../_models/product-stock-warehouse-audit';
import { StockAuditSourceEnum } from '../_enum/stock-audit-source.enum';
import { ClientSubscriptionDetails } from '../_models/client-subscription-details.model';

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
        async (data: {
          additionalStockQuantity: number;
          transactionNo: string;
          plateNo: string;
        }) => {
          if (!data || data.additionalStockQuantity === 0) return;

          const checkPurchaseOrderCodeExists = await firstValueFrom(this.productService.checkPurchaseOrderCodeExists(0, data.transactionNo));

          if (checkPurchaseOrderCodeExists) {
            this.notificationService.openErrorNotification(this.translateService.instant(
              'PURCHASE_ORDER_DETAILS_PAGE.PURCHASE_ORDER_GENERAL_INFO_PANEL.FORM_CONTROL_SECTION.REFERENCE_NO_CONTROL.ALREADY_EXIST_ERROR_MESSAGE'
            ))
            return;
          }

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

              const purchaseOrder = new ProductWarehouseStockReceiptEntry();
              purchaseOrder.id = 0;
              purchaseOrder.supplierId = this.selectedProduct().supplierId;
              purchaseOrder.stockEntryDate = new Date();
              purchaseOrder.referenceNo = data.transactionNo;
              purchaseOrder.plateNo = data.plateNo;

              const productStockWarehouseAudit = new ProductStockWarehouseAudit();
              productStockWarehouseAudit.id = 0;
              productStockWarehouseAudit.productId = this.selectedProduct().id;
              productStockWarehouseAudit.quantity = data.additionalStockQuantity;
              productStockWarehouseAudit.pricePerUnit = this.selectedProduct().pricePerUnit;
              productStockWarehouseAudit.stockAuditSource = StockAuditSourceEnum.OrderFromSupplier;

              purchaseOrder.productStockWarehouseAuditInputs = [productStockWarehouseAudit];

              this.productService
                .updateWarehouseStockReceiptEntries([purchaseOrder])
                .subscribe({
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
                  }
                });
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
    if (this.clientSubscriptionDetails.productSKUMax === 0 || this.totalProducts() <= this.clientSubscriptionDetails.productSKUMax) {
      this.router.navigate(['product-catalogue/add-product'], { state: { productSource: ProductSourceEnum.Warehouse } });
    } else {
      this.applySubscriptionService.open(this.translateService.instant("SUBSCRIPTION_TEXTS.PRODUCT_REGISTRATION_LIMIT_ERROR", { productSKUMax: this.clientSubscriptionDetails.productSKUMax }));
    }
  }

  productImport() {
    this.router.navigate(['warehouse-products/product-import'], { state: { productSource: ProductSourceEnum.Warehouse } });
  }

  get dataSource(): WarehouseProductDataSource {
    return this._dataSource;
  }
}
