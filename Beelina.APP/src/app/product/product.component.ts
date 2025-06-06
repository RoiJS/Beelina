import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject, input, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import {
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';

import { AddProductStockQuantityDialogComponent } from './add-product-stock-quantity-dialog/add-product-stock-quantity-dialog.component';
import { AddToCartProductComponent } from './add-to-cart-product/add-to-cart-product.component';
import { SearchFieldComponent } from '../shared/ui/search-field/search-field.component';
import { SharedComponent } from '../shared/components/shared/shared.component';
import { TransferProductInventoryComponent } from './transfer-product-inventory/transfer-product-inventory.component';

import { AuthService } from '../_services/auth.service';
import { DialogService } from '../shared/ui/dialog/dialog.service';
import { LocalProductsDbService } from '../_services/local-db/local-products-db.service';
import { LocalSyncDataService } from '../_services/local-db/local-sync-data.service';
import { NetworkService } from '../_services/network.service';
import { NotificationService } from '../shared/ui/notification/notification.service';
import { ProductService } from '../_services/product.service';
import { StorageService } from '../_services/storage.service';
import { UIService } from '../_services/ui.service';

import * as ProductTransactionActions from './add-to-cart-product/store/actions';
import * as ProductActions from './store/actions';

import { ProductTransaction } from '../_models/transaction';
import { productTransactionsSelector } from './add-to-cart-product/store/selectors';
import { errorSelector, filterKeywordSelector, isLoadingSelector, supplierIdSelector, totalCountSelector } from './store/selectors';

import { BusinessModelEnum } from '../_enum/business-model.enum';
import { ButtonOptions } from '../_enum/button-options.enum';
import { ModuleEnum } from '../_enum/module.enum';
import {
  PermissionLevelEnum
} from '../_enum/permission-level.enum';
import { ProductSourceEnum } from '../_enum/product-source.enum';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import { InsufficientProductQuantity } from '../_models/insufficient-product-quantity';
import { Product } from '../_models/product';
import { ProductDataSource } from '../_models/datasources/product.datasource';
import { User } from '../_models/user.model';

import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';
import { ProductsFilter } from '../_models/filters/products.filter';
import { ProductFilterComponent } from './product-filter/product-filter.component';
import { ProductWithdrawalEntry } from '../_models/product-withdrawal-entry';
import { ProductStockAudit } from '../_models/product-stock-audit';
import { StockAuditSourceEnum } from '../_enum/stock-audit-source.enum';

import { ApplySubscriptionService } from '../_services/apply-subscription.service';
import { ClientSubscriptionDetails } from '../_models/client-subscription-details.model';
import { LocalClientSubscriptionDbService } from '../_services/local-db/local-client-subscription-db.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent
  extends SharedComponent
  implements OnInit, OnDestroy, AfterViewInit {
  searchFieldComponent = viewChild(SearchFieldComponent);

  businessModel = signal<BusinessModelEnum>(BusinessModelEnum.WarehousePanelMonitoring);
  currentSalesAgentId: number = 0;
  dataSource = signal<ProductDataSource>(null);
  filterKeyword = signal<string>('');
  itemCounter = signal(0);
  productsFilter = signal<ProductsFilter>(new ProductsFilter());
  productTransactions = signal<Array<ProductTransaction>>([]);
  salesAgents = signal<Array<User>>([]);
  selectedProduct = signal<Product>(null);
  totalProductCount = signal<number>(0);
  totalProductValue = signal<string>('');
  transactionId = signal<number>(0);
  warehouseId = signal<number>(1);

  _dialogAddQuantityRef: MatBottomSheetRef<
    AddProductStockQuantityDialogComponent,
    {
      additionalStockQuantity: number;
      transactionNo: string;
      productSource: ProductSourceEnum;
    }
  >;

  _dialogOpenFilterRef: MatBottomSheetRef<
    ProductFilterComponent,
    {
      supplierId: number;
    }
  >;

  _subscription: Subscription = new Subscription();
  _transferInventoryDialogRef: MatBottomSheetRef<TransferProductInventoryComponent>;
  clientSubscriptionDetails: ClientSubscriptionDetails;

  applySubscriptionService = inject(ApplySubscriptionService);
  authService = inject(AuthService);
  bottomSheet = inject(MatBottomSheet);
  dialogService = inject(DialogService);
  localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService);
  localProductsDbService = inject(LocalProductsDbService);
  localSyncDataService = inject(LocalSyncDataService);
  networkService = inject(NetworkService);
  notificationService = inject(NotificationService);
  productService = inject(ProductService);
  router = inject(Router);
  store = inject(Store<AppStateInterface>);
  storageService = inject(StorageService);
  translateService = inject(TranslateService);

  constructor(
    protected override activatedRoute: ActivatedRoute,
    protected override uiService: UIService
  ) {
    super(uiService);
    this.businessModel.set(this.authService.businessModel);
    this.transactionId.set(+this.activatedRoute.snapshot.paramMap.get('transactionId'));

    this.localProductsDbService.reset();
    this.store.dispatch(ProductActions.resetProductState());
    this.store.dispatch(
      ProductTransactionActions.initializeProductTransactions()
    );

    this.$isLoading = this.store.pipe(select(isLoadingSelector));

    this.store.pipe(select(errorSelector)).subscribe((result: string) => {
      if (result) {
        this.notificationService.openErrorNotification(this.translateService.instant('PRODUCTS_CATALOGUE_PAGE.TEXT_ORDER_DIALOG.LOAD_PRODUCT_LIST_ERROR_MESSAGE'));
      }
    })
    this._currentLoggedInUser = this.authService.user.value;

    this._subscription.add(
      this.store
        .pipe(select(productTransactionsSelector))
        .subscribe((productTransactions: Array<ProductTransaction>) => {
          this.productTransactions.set(productTransactions);
          this.itemCounter.set(this.productTransactions().length);

          if (this.transactionId() === 0) {
            this.storageService.storeString(
              'productTransactions',
              JSON.stringify(this.productTransactions())
            );
          }
        })
    );

    if (
      this.currentUserPermission ===
      this.getPermissionLevel(PermissionLevelEnum.User)
    ) {
      this.currentSalesAgentId = this._currentLoggedInUser.id;
      this.storageService.storeString(
        'currentSalesAgentId',
        this._currentLoggedInUser.id.toString()
      );
      this.calculateTotalInventoryValue();
      this.dataSource.set(new ProductDataSource(this.store));
    } else {
      this.productService.getSalesAgentsList().subscribe({
        next: (data: Array<User>) => {
          this.salesAgents.set(data);

          if (this.storageService.hasKey('currentSalesAgentId')) {
            this.currentSalesAgentId = +this.storageService.getString(
              'currentSalesAgentId'
            );

            this.calculateTotalInventoryValue();
            this.dataSource.set(new ProductDataSource(this.store));
          }
        },
      });
    }
  }

  override async ngOnInit() {
    super.ngOnInit();
    this.clientSubscriptionDetails = await this.localClientSubscriptionDbService.getLocalClientSubsription();
  }

  override ngOnDestroy() {
    this._subscription.unsubscribe();
    this.store.dispatch(ProductActions.getProductsCancelAction());
    this._transferInventoryDialogRef = null;
    this._dialogOpenFilterRef = null;
    this._dialogAddQuantityRef = null;
    super.ngOnDestroy();
  }

  ngAfterViewInit() {
    this._subscription.add(
      this.store.pipe(select(filterKeywordSelector))
        .subscribe((filterKeyword: string) => {
          this.filterKeyword.set(filterKeyword);
          this.searchFieldComponent().value(filterKeyword);
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
          this.totalProductCount.set(totalCount);
        })
    );
  }

  async syncProducts() {
    this.notificationService.openSuccessNotification(
      this.translateService.instant("PRODUCTS_CATALOGUE_PAGE.SYNC_PRODUCTS_DIALOG.SYNCING_NOTIFICATION_MESSAGE")
    );
    await this.localProductsDbService.clear();
    await this.localProductsDbService.getProductUnitsFromServer()
    await this.localProductsDbService.getProductsFromServer();
    this.notificationService.openSuccessNotification(
      this.translateService.instant("PRODUCTS_CATALOGUE_PAGE.SYNC_PRODUCTS_DIALOG.SYNCED_NOTIFICATION_MESSAGE")

    );
  }

  goToCart() {
    this.router.navigate([`product-catalogue/product-cart`], {
      state: {
        isLocalTransaction: !this.networkService.isOnline.value,
      }
    });
  }

  editProduct(id: number) {
    this.router.navigate([`product-catalogue/edit-product/${id}`], { state: { productSource: ProductSourceEnum.Panel } });
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
              this.store.dispatch(ProductActions.resetProductState());
              this.store.dispatch(ProductActions.getProductsAction());
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

  addProduct() {
    if (this.clientSubscriptionDetails.productSKUMax === 0 || this.totalProductCount() <= this.clientSubscriptionDetails.productSKUMax) {
      this.router.navigate(['product-catalogue/add-product'], { state: { productSource: ProductSourceEnum.Panel } });
    } else {
      this.applySubscriptionService.open(this.translateService.instant("SUBSCRIPTION_TEXTS.PRODUCT_REGISTRATION_LIMIT_ERROR", { productSKUMax: this.clientSubscriptionDetails.productSKUMax }));
    }
  }

  addItemToCart(productId: number) {
    if (
      this.currentUserPermission ===
      this.getPermissionLevel(PermissionLevelEnum.User)
    ) {
      this.bottomSheet.open(AddToCartProductComponent, {
        data: { productId, productTransactions: this.productTransactions() },
      });
    } else {
      this.editProduct(productId);
    }
  }

  openTextParserDialog() {
    if (this.currentUserPermission < this.getPermissionLevel(PermissionLevelEnum.Manager)) {
      this.router.navigate(['product-catalogue/text-order']);
    } else {
      if (this.currentSalesAgentId > 0) {
        this.router.navigate(['product-catalogue/text-inventories']);
      } else {
        this.dialogService.openAlert(
          this.translateService.instant(
            'PRODUCTS_CATALOGUE_PAGE.NO_SELECTED_SALES_AGENT_DIALOG.TITLE'
          ),
          this.translateService.instant(
            'PRODUCTS_CATALOGUE_PAGE.NO_SELECTED_SALES_AGENT_DIALOG.DESCRIPTION'
          )
        );
      }
    }
  }

  onSearch(filterKeyword: string) {
    this.localProductsDbService.reset();
    this.store.dispatch(ProductActions.resetProductState());
    this.store.dispatch(
      ProductActions.setSearchProductAction({ keyword: filterKeyword })
    );
    this.store.dispatch(ProductActions.getProductsAction());
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

          const productsFilter = new ProductsFilter();
          productsFilter.supplierId = data.supplierId;
          this.productsFilter.set(productsFilter);

          this.store.dispatch(ProductActions.resetProductState());
          this.store.dispatch(ProductActions.setFilterProductAction({
            productsFilter: this.productsFilter()
          }));
          this.store.dispatch(ProductActions.getProductsAction());
        });
  }

  calculateTotalInventoryValue() {
    if (!this.networkService.isOnline.value) return;
    this._subscription.add(this.productService.getPanelInventoryTotalValue().subscribe({
      next: (data: number) => {
        this.totalProductValue.set(NumberFormatter.formatCurrency(data));
      },
    }));
  }

  switchSaleAgent(e) {
    this.storageService.storeString('currentSalesAgentId', e.value.toString());
    this.currentSalesAgentId = e.value;
    this.store.dispatch(ProductActions.resetProductState());
    this.store.dispatch(
      ProductTransactionActions.initializeProductTransactions()
    );

    this.calculateTotalInventoryValue();
    if (!this.dataSource()) {
      this.dataSource.set(new ProductDataSource(this.store));
    } else {
      this.store.dispatch(ProductActions.getProductsAction());
    }
  }

  transferProductInventory(productId: number) {
    this._transferInventoryDialogRef = this.bottomSheet.open(TransferProductInventoryComponent, {
      data: { productId, productSource: ProductSourceEnum.Panel },
    });
    this._transferInventoryDialogRef.afterDismissed().subscribe((result: boolean) => {
      if (result) {
        this.store.dispatch(ProductActions.resetProductState());
        this.store.dispatch(ProductActions.setSearchProductAction({ keyword: this.searchFieldComponent().value() }));
        this.store.dispatch(ProductActions.getProductsAction());
      }
    })
  }

  addProductStockQuantity(product: Product) {
    this.selectedProduct.set(product);
    this._dialogAddQuantityRef = this.bottomSheet.open(AddProductStockQuantityDialogComponent, {
      data: {
        additionalStockQuantity: 0,
        transactionNo: '',
        productSource: ProductSourceEnum.Panel
      },
    });

    this._dialogAddQuantityRef
      .afterDismissed()
      .subscribe(
        (data: {
          additionalStockQuantity: number;
          transactionNo: string;
          productSource: ProductSourceEnum;
        }) => {
          if (!data || data.additionalStockQuantity === 0) return;

          this.productService
            .checkWarehouseProductStockQuantity(this.selectedProduct().id, this.warehouseId(), data.additionalStockQuantity)
            .subscribe((insufficientStocks: Array<InsufficientProductQuantity>) => {
              if (insufficientStocks.length > 0) {
                this.dialogService
                  .openAlert(
                    this.translateService.instant(
                      'EDIT_PRODUCT_DETAILS_PAGE.CHECK_WAREHOUSE_PRODUCT_QUANTITY_DIALOG.TITLE'
                    ),
                    this.translateService.instant(
                      'EDIT_PRODUCT_DETAILS_PAGE.CHECK_WAREHOUSE_PRODUCT_QUANTITY_DIALOG.ERROR_MESSAGE'
                    ).replace("{0}", insufficientStocks[0].currentQuantity.toString())
                  )
                return;
              } else {
                updateStockValue();
              }
            });

          const updateStockValue = () => {
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
                  ProductActions.setUpdateProductLoadingState({
                    state: true,
                  })
                );

                const productWithdrawal = new ProductWithdrawalEntry();
                productWithdrawal.id = 0;
                productWithdrawal.userAccountId = +this.storageService.getString('currentSalesAgentId');
                productWithdrawal.stockEntryDate = new Date();
                productWithdrawal.withdrawalSlipNo = data.transactionNo;

                const productStockAudits = new ProductStockAudit();
                productStockAudits.id = 0;
                productStockAudits.productId = this.selectedProduct().id;
                productStockAudits.quantity = data.additionalStockQuantity;
                productStockAudits.pricePerUnit = this.selectedProduct().pricePerUnit;
                productStockAudits.warehouseId = this.warehouseId();
                productStockAudits.stockAuditSource = StockAuditSourceEnum.FromWithdrawal;

                productWithdrawal.productStockAudits = [productStockAudits];

                this.productService
                  .updateProductWithdrawalEntries([productWithdrawal])
                  .subscribe({
                    next: () => {
                      this.notificationService.openSuccessNotification(this.translateService.instant(
                        'PRODUCTS_CATALOGUE_PAGE.ADD_PRODUCT_STOCK_QUANTITY_DIALOG.SUCCESS_MESSAGE'
                      ));
                      this.store.dispatch(
                        ProductActions.setUpdateProductLoadingState({
                          state: false,
                        })
                      );

                      this.store.dispatch(ProductActions.resetProductState());
                      this.store.dispatch(ProductActions.setSearchProductAction({ keyword: this.searchFieldComponent().value() }));
                      this.store.dispatch(ProductActions.getProductsAction());
                    },

                    error: () => {
                      this.notificationService.openErrorNotification(this.translateService.instant(
                        'PRODUCTS_CATALOGUE_PAGE.ADD_PRODUCT_STOCK_QUANTITY_DIALOG.ERROR_MESSAGE'
                      ));

                      this.store.dispatch(
                        ProductActions.setUpdateProductLoadingState({
                          state: false,
                        })
                      );
                    },
                  });
              }
            })
          }
        }
      );
  }

  get currentUserPermission(): number {
    return this.modulePrivilege(ModuleEnum.Distribution);
  }
}
