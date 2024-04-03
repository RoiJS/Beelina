import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import {
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';

import { AccountVerificationComponent } from '../shared/account-verification/account-verification.component';
import { AddToCartProductComponent } from './add-to-cart-product/add-to-cart-product.component';
import { TransferProductInventoryComponent } from './transfer-product-inventory/transfer-product-inventory.component';

import { ProductService } from '../_services/product.service';
import { StorageService } from '../_services/storage.service';
import { DialogService } from '../shared/ui/dialog/dialog.service';

import { ButtonOptions } from '../_enum/button-options.enum';

import { AppStateInterface } from '../_interfaces/app-state.interface';

import * as ProductTransactionActions from './add-to-cart-product/store/actions';
import * as ProductActions from './store/actions';

import { Product } from '../_models/product';
import { ProductTransaction } from '../_models/transaction';
import { productTransactionsSelector } from './add-to-cart-product/store/selectors';
import { errorSelector, filterKeywordSelector, isLoadingSelector, totalCountSelector } from './store/selectors';

import { ModuleEnum } from '../_enum/module.enum';
import {
  PermissionLevelEnum,
  getPermissionLevelEnum,
} from '../_enum/permission-level.enum';
import { ProductSourceEnum } from '../_enum/product-source.enum';
import { ProductDataSource } from '../_models/datasources/product.datasource';
import { InsufficientProductQuantity } from '../_models/insufficient-product-quantity';
import { User } from '../_models/user.model';
import { AuthService } from '../_services/auth.service';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { NotificationService } from '../shared/ui/notification/notification.service';

import { SearchFieldComponent } from '../shared/ui/search-field/search-field.component';
import { AddProductStockQuantityDialogComponent } from './add-product-stock-quantity-dialog/add-product-stock-quantity-dialog.component';
import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent
  extends BaseComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(SearchFieldComponent) searchFieldComponent: SearchFieldComponent;

  private _dataSource: ProductDataSource;
  private _itemCounter: number;
  private _productTransactions: Array<ProductTransaction>;
  private _transactionId: number;
  private _subscription: Subscription = new Subscription();
  private _allowManageProductDetails = false;
  private _accountVerificationDialogRef: MatBottomSheetRef<AccountVerificationComponent>;
  private _transferInventoryDialogRef: MatBottomSheetRef<TransferProductInventoryComponent>;
  private _salesAgents: Array<User>;
  private _dialogRef: MatBottomSheetRef<
    AddProductStockQuantityDialogComponent,
    {
      additionalStockQuantity: number;
      transactionNo: string;
    }
  >;
  private _selectedProduct: Product;
  private _totalProductCount: number;
  private _totalProductValue: string;
  private _totalProductValueSubscription: Subscription;

  currentSalesAgentId: number = 0;
  private _filterKeyword: string;
  private _warehouseId: number = 1;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private dialogService: DialogService,
    private bottomSheet: MatBottomSheet,
    private productService: ProductService,
    private router: Router,
    private store: Store<AppStateInterface>,
    private notificationService: NotificationService,
    private storageService: StorageService,
    private translateService: TranslateService
  ) {
    super();
    this._transactionId =
      +this.activatedRoute.snapshot.paramMap.get('transactionId');

    this._allowManageProductDetails = JSON.parse(
      this.storageService.getString('allowManageProductDetails')
    );

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
      this._dataSource = new ProductDataSource(this.store);
    } else {
      this.productService.getSalesAgentsList().subscribe({
        next: (data: Array<User>) => {
          this._salesAgents = data;

          if (this.storageService.hasKey('currentSalesAgentId')) {
            this.currentSalesAgentId = +this.storageService.getString(
              'currentSalesAgentId'
            );

            this.calculateTotalInventoryValue();
            this._dataSource = new ProductDataSource(this.store);
          }
        },
      });
    }
  }

  ngOnInit() { }

  ngOnDestroy() {
    this._subscription.unsubscribe();
    if (this._totalProductValueSubscription) this._totalProductValueSubscription.unsubscribe();
    this.store.dispatch(ProductActions.getProductsCancelAction());
    this._accountVerificationDialogRef = null;
    this._transferInventoryDialogRef = null;
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

  goToCart() {
    this.router.navigate([`product-catalogue/product-cart`]);
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
    this.router.navigate(['product-catalogue/add-product'], { state: { productSource: ProductSourceEnum.Panel } });
  }

  addItemToCart(productId: number) {
    if (
      this.currentUserPermission ===
      this.getPermissionLevel(PermissionLevelEnum.User)
    ) {
      this.bottomSheet.open(AddToCartProductComponent, {
        data: { productId, productTransactions: this._productTransactions },
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

  deactivateAllowManageProductDetailsDialog() {
    this._allowManageProductDetails = false;
    this.storageService.storeString(
      'allowManageProductDetails',
      JSON.stringify(this._allowManageProductDetails)
    );
  }

  openAllowManageProductDetailsDialog() {
    const defaultUsername = this.storageService.getString(
      'allowManageProductDetailsDefaultUsername'
    );
    this._accountVerificationDialogRef = this.bottomSheet.open(AccountVerificationComponent, {
      data: { defaultUsername },
    });

    this._accountVerificationDialogRef.afterDismissed().subscribe((data: User) => {
      // We assume that if the returned value from the dialog is undefined,
      // it means that the user just simply canceled the dialog.
      if (data === undefined) return;

      if (data !== null) {
        const retailModulePrivilege = data.getModulePrivilege(
          ModuleEnum.Retail
        );
        if (
          retailModulePrivilege &&
          retailModulePrivilege >
          getPermissionLevelEnum(PermissionLevelEnum.User)
        ) {
          this._allowManageProductDetails = true;
          this.storageService.storeString(
            'allowManageProductDetailsDefaultUsername',
            data.username
          );
          this.storageService.storeString(
            'allowManageProductDetails',
            JSON.stringify(this._allowManageProductDetails)
          );
          this.notificationService.openSuccessNotification(this.translateService.instant(
            'PRODUCTS_CATALOGUE_PAGE.ALLOW_MANAGE_PRODUCT_DETAILS_DIALOG.SUCCESS_MESSAGE'
          ));
        } else {
          this.notificationService.openErrorNotification(this.translateService.instant(
            'PRODUCTS_CATALOGUE_PAGE.ALLOW_MANAGE_PRODUCT_DETAILS_DIALOG.INVALID_USER_PRIVILEGE_MESSAGE'
          ));
        }
      } else {
        this.notificationService.openErrorNotification(this.translateService.instant(
          'PRODUCTS_CATALOGUE_PAGE.ALLOW_MANAGE_PRODUCT_DETAILS_DIALOG.ERROR_MESSAGE'
        ));
      }
    });
  }

  onSearch(filterKeyword: string) {
    this.store.dispatch(ProductActions.resetProductState());
    this.store.dispatch(
      ProductActions.setSearchProductAction({ keyword: filterKeyword })
    );
    this.store.dispatch(ProductActions.getProductsAction());
  }

  onClear() {
    this.onSearch('');
  }

  calculateTotalInventoryValue() {
    this._totalProductValueSubscription = this.productService.getPanelInventoryTotalValue().subscribe({
      next: (data: number) => {
        this._totalProductValue = NumberFormatter.formatCurrency(data);
      },
    })
  }

  switchSaleAgent(e) {
    this.storageService.storeString('currentSalesAgentId', e.value.toString());
    this.currentSalesAgentId = e.value;
    this.store.dispatch(ProductActions.resetProductState());
    this.store.dispatch(
      ProductTransactionActions.initializeProductTransactions()
    );

    this.calculateTotalInventoryValue();
    if (!this._dataSource) {
      this._dataSource = new ProductDataSource(this.store);
    } else {
      this.store.dispatch(ProductActions.getProductsAction());
    }
  }

  transferProductInventory(productId: number) {
    this._transferInventoryDialogRef = this.bottomSheet.open(TransferProductInventoryComponent, {
      data: { productId },
    });
    this._transferInventoryDialogRef.afterDismissed().subscribe((result: boolean) => {
      if (result) {
        this.store.dispatch(ProductActions.resetProductState());
        this.store.dispatch(ProductActions.setSearchProductAction({ keyword: this.searchFieldComponent.value() }));
        this.store.dispatch(ProductActions.getProductsAction());
      }
    })
  }

  addProductStockQuantity(product: Product) {
    this._selectedProduct = product;
    this._dialogRef = this.bottomSheet.open(AddProductStockQuantityDialogComponent, {
      data: {
        additionalStockQuantity: 0,
        transactionNo: '',
        productSource: ProductSourceEnum.Panel
      },
    });

    this._dialogRef
      .afterDismissed()
      .subscribe(
        (data: {
          additionalStockQuantity: number;
          transactionNo: string;
          productSource: ProductSourceEnum;
        }) => {
          if (!data || data.additionalStockQuantity === 0) return;

          this.productService
            .checkWarehouseProductStockQuantity(this._selectedProduct.id, this._warehouseId, data.additionalStockQuantity)
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

                this.productService.updateProductInformation([product]).subscribe({
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
                    this.store.dispatch(ProductActions.setSearchProductAction({ keyword: this.searchFieldComponent.value() }));
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
                })
              }
            })
          }
        }
      );
  }

  get itemCounter(): number {
    return this._itemCounter;
  }

  get dataSource(): ProductDataSource {
    return this._dataSource;
  }

  get currentUserPermission(): number {
    return this.modulePrivilege(ModuleEnum.Retail);
  }

  get allowManageProductDetails(): boolean {
    return this._allowManageProductDetails;
  }

  get salesAgents(): Array<User> {
    return this._salesAgents;
  }

  get filterKeyword(): string {
    return this._filterKeyword;
  }

  get totalProducts(): number {
    return this._totalProductCount;
  }

  get totalProductValue(): string {
    return this._totalProductValue;
  }
}
