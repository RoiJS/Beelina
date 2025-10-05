import { AfterViewInit, Component, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, take, combineLatest, firstValueFrom } from 'rxjs';

import {
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';

import { AddProductStockQuantityDialogComponent } from './add-product-stock-quantity-dialog/add-product-stock-quantity-dialog.component';
import { AddToCartProductComponent } from './add-to-cart-product/add-to-cart-product.component';
import { CopyProductConfirmationComponent } from './copy-product-confirmation/copy-product-confirmation.component';
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
import { activeStatusSelector, errorSelector, filterKeywordSelector, isLoadingSelector, supplierIdSelector, totalCountSelector } from './store/selectors';

import { BusinessModelEnum } from '../_enum/business-model.enum';
import { ButtonOptions } from '../_enum/button-options.enum';
import { ModuleEnum } from '../_enum/module.enum';
import {
  PermissionLevelEnum
} from '../_enum/permission-level.enum';
import { ProductSourceEnum } from '../_enum/product-source.enum';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import { Product } from '../_models/product';
import { ProductDataSource } from '../_models/datasources/product.datasource';
import { User } from '../_models/user.model';

import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';
import { ProductsFilter } from '../_models/filters/products.filter';
import { ProductFilterComponent } from './product-filter/product-filter.component';

import { ApplySubscriptionService } from '../_services/apply-subscription.service';
import { ClientSubscriptionDetails } from '../_models/client-subscription-details.model';
import { LocalClientSubscriptionDbService } from '../_services/local-db/local-client-subscription-db.service';
import { StockStatusEnum } from '../_enum/stock-status.enum';
import { PriceStatusEnum } from '../_enum/price-status.enum';

import {
  endCursorSelector as endCursorProductSelector,
  filterKeywordSelector as filterKeywordProductSelector,
  priceStatusSelector,
  stockStatusSelector,
  supplierIdSelector as supplierIdProductSelector,
} from '../product/store/selectors';
import { ProductActiveStatusEnum } from '../_enum/product-active-status.enum';

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
  currentSalesAgent: User = null;
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
      stockStatus: StockStatusEnum;
      priceStatus: PriceStatusEnum;
    }
  >;

  _dialogCopyProductRef: MatBottomSheetRef<CopyProductConfirmationComponent>;

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
      this.currentSalesAgent = this._currentLoggedInUser;

      this.storageService.storeString('currentSalesAgentId', this.currentSalesAgent.id.toString());
      this.storageService.storeString('currentSalesAgentType', this.currentSalesAgent.salesAgentType);
      this.calculateTotalInventoryValue();
      this.dataSource.set(new ProductDataSource(this.store));
    } else {
      this.productService.getSalesAgentsList().subscribe({
        next: (data: Array<User>) => {
          this.salesAgents.set(data);

          if (this.storageService.hasKey('currentSalesAgentId') && this.storageService.hasKey('currentSalesAgentType')) {
            this.currentSalesAgent = this.salesAgents().find(
              (user: User) => user.id === +this.storageService.getString('currentSalesAgentId')
            )
            this.currentSalesAgentId = +this.storageService.getString('currentSalesAgentId');

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
    this.store.dispatch(ProductActions.resetProductState());
    this._transferInventoryDialogRef = null;
    this._dialogOpenFilterRef = null;
    this._dialogAddQuantityRef = null;
    this._dialogCopyProductRef = null;
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

          this._subscription.add(
            combineLatest([
              this.store.select(supplierIdProductSelector),
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

  goToPriceAssignment() {
    this.router.navigate(['product-catalogue/product-price-assignment']);
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

  async copyProductItem(product: Product) {
    this.selectedProduct.set(product);

    const copyProduct = new Product();
    const copyOfText = this.translateService.instant("GENERAL_TEXTS.COPY_OF");

    // Get the latest product code and use it if available
    const latestProductCode = await firstValueFrom(this.productService.getLatestProductCode());

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
    copyProduct.costPrice = this.selectedProduct().costPrice || 0;
    copyProduct.supplierId = this.selectedProduct().supplierId;
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

    // Set the copy's valid from date to current date
    copyProduct.validFrom = new Date();
    copyProduct.validTo = null;

    // Open the copy product confirmation dialog
    this._dialogCopyProductRef = this.bottomSheet.open(CopyProductConfirmationComponent, {
      data: {
        productName: copyProduct.name
      }
    });

    this._subscription.add(
      this._dialogCopyProductRef
        .afterDismissed()
        .subscribe(
          (data: {
            confirm: boolean;
            setValidToDate: boolean;
          }) => {
            if (!data || !data.confirm) return;

            // Handle valid dates based on user choice and product group
            if (data.setValidToDate) {
              // User wants to set validTo date and products are in same group
              this.updateOriginalProductAndCreateCopy(copyProduct);
            } else {
              // Either user doesn't want validTo date or products are not in same group
              copyProduct.productParentGroupId = null; // Reset parent group to avoid grouping
              copyProduct.parent = true; // The copy is a parent itself
              this.createProductCopyDirectly(copyProduct);
            }
          }
        )
    );
  }

  private updateOriginalProductAndCreateCopy(copyProduct: Product) {
    const currentDate = new Date();
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1);

    // Create a proper Product instance for the original
    const originalProduct = new Product();
    Object.assign(originalProduct, this.selectedProduct());
    originalProduct.validTo = previousDay;

    // Update the original product first
    this._subscription.add(
      this.productService.updateProductInformation([originalProduct]).subscribe({
        next: () => {
          // Then proceed with creating the copy
          this.createProductCopyDirectly(copyProduct);
        },
        error: () => {
          this.notificationService.openErrorNotification(
            this.translateService.instant(
              'PRODUCTS_CATALOGUE_PAGE.COPY_PRODUCT_DIALOG.ERROR_MESSAGE'
            )
          );
        }
      })
    );
  }

  private createProductCopyDirectly(copyProduct: Product) {
    this._subscription.add(
      this.productService.updateProductInformation([copyProduct]).subscribe({
        next: () => {
          this.notificationService.openSuccessNotification(
            this.translateService.instant(
              'PRODUCTS_CATALOGUE_PAGE.COPY_PRODUCT_DIALOG.SUCCESS_MESSAGE'
            )
          );
          this.store.dispatch(ProductActions.resetProductState());
          this.store.dispatch(ProductActions.getProductsAction());
        },
        error: () => {
          this.notificationService.openErrorNotification(
            this.translateService.instant(
              'PRODUCTS_CATALOGUE_PAGE.COPY_PRODUCT_DIALOG.ERROR_MESSAGE'
            )
          );
        },
      })
    );
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
    let supplierId = 0,
      stockStatus = StockStatusEnum.All,
      priceStatus = PriceStatusEnum.All,
      activeStatus = ProductActiveStatusEnum.ActiveOnly;

    const defaultProductsFilter = new ProductsFilter();
    defaultProductsFilter.supplierId = supplierId;
    defaultProductsFilter.stockStatus = stockStatus;
    defaultProductsFilter.priceStatus = priceStatus;
    defaultProductsFilter.activeStatus = activeStatus;

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
    this.currentSalesAgent = <User>e.value;
    this.currentSalesAgentId = (<User>e.value).id;
    this.storageService.storeString('currentSalesAgentId', this.currentSalesAgent.id.toString());
    this.storageService.storeString('currentSalesAgentType', this.currentSalesAgent.salesAgentType);
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

  resetSalesAgentProductStocks() {
    this.dialogService
      .openConfirmation(
        this.translateService.instant(
          'PRODUCTS_CATALOGUE_PAGE.RESET_PRODUCT_STOCKS_DIALOG.TITLE'
        ),
        this.translateService.instant(
          'PRODUCTS_CATALOGUE_PAGE.RESET_PRODUCT_STOCKS_DIALOG.CONFIRM'
        )
      )
      .subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this.productService.resetSalesAgentProductStocks(this.currentSalesAgentId).subscribe({
            next: (success: boolean) => {
              if (success) {
                this.notificationService.openSuccessNotification(
                  this.translateService.instant(
                    'PRODUCTS_CATALOGUE_PAGE.RESET_PRODUCT_STOCKS_DIALOG.SUCCESS_MESSAGE'
                  )
                );
                // Refresh the product list to show updated stock quantities
                this.store.dispatch(ProductActions.resetProductState());
                this.store.dispatch(ProductActions.getProductsAction());
                this.calculateTotalInventoryValue();
              } else {
                this.notificationService.openErrorNotification(
                  this.translateService.instant(
                    'PRODUCTS_CATALOGUE_PAGE.RESET_PRODUCT_STOCKS_DIALOG.FAILURE_MESSAGE'
                  )
                );
              }
            },
            error: (error) => {
              this.notificationService.openErrorNotification(
                this.translateService.instant(
                  'PRODUCTS_CATALOGUE_PAGE.RESET_PRODUCT_STOCKS_DIALOG.ERROR_MESSAGE'
                ) + ': ' + error.message
              );
            }
          });
        }
      });
  }

  addProductStockQuantity() {
    this.router.navigate(['/purchase-orders']);
  }

  get currentUserPermission(): number {
    return this.modulePrivilege(ModuleEnum.Distribution);
  }
}
