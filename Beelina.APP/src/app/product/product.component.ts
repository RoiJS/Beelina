import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';

import {
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AddToCartProductComponent } from './add-to-cart-product/add-to-cart-product.component';
import { AccountVerificationComponent } from '../shared/account-verification/account-verification.component';
import { TransferProductInventoryComponent } from './transfer-product-inventory/transfer-product-inventory.component';
import { TextOrderComponent } from './text-order/text-order.component';

import { ProductService } from '../_services/product.service';
import { StorageService } from '../_services/storage.service';
import { DialogService } from '../shared/ui/dialog/dialog.service';

import { ButtonOptions } from '../_enum/button-options.enum';

import { AppStateInterface } from '../_interfaces/app-state.interface';

import * as ProductTransactionActions from './add-to-cart-product/store/actions';
import * as ProductActions from './store/actions';

import { ProductTransaction } from '../_models/transaction';
import { productTransactionsSelector } from './add-to-cart-product/store/selectors';
import { isLoadingSelector } from './store/selectors';

import { ProductDataSource } from '../_models/datasources/product.datasource';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { AuthService } from '../_services/auth.service';
import { User } from '../_models/user.model';
import { ModuleEnum } from '../_enum/module.enum';
import {
  PermissionLevelEnum,
  getPermissionLevelEnum,
} from '../_enum/permission-level.enum';
import { SearchFieldComponent } from '../shared/ui/search-field/search-field.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
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

  currentSalesAgentId: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private dialogService: DialogService,
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

    this._allowManageProductDetails = JSON.parse(
      this.storageService.getString('allowManageProductDetails')
    );

    this.store.dispatch(ProductActions.resetProductState());
    this.store.dispatch(
      ProductTransactionActions.initializeProductTransactions()
    );

    this.$isLoading = this.store.pipe(select(isLoadingSelector));
    this._currentUser = this.authService.user.value;

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
      this.currentSalesAgentId = this._currentUser.id;
      this.storageService.storeString(
        'currentSalesAgentId',
        this._currentUser.id.toString()
      );
      this._dataSource = new ProductDataSource(this.store);
    } else {
      this.productService.getSalesAgentsList().subscribe({
        next: (data: Array<User>) => {
          this._salesAgents = data;

          if (this.storageService.hasKey('currentSalesAgentId')) {
            this.currentSalesAgentId = +this.storageService.getString(
              'currentSalesAgentId'
            );

            this._dataSource = new ProductDataSource(this.store);
          }
        },
      });
    }
  }

  ngOnInit() { }

  ngOnDestroy() {
    this._subscription.unsubscribe();
    this._accountVerificationDialogRef = null;
    this._transferInventoryDialogRef = null;
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
                this.translateService.instant('GENERAL_TEXTS.CLOSE')
              );
              this.store.dispatch(ProductActions.resetProductState());
              this.store.dispatch(ProductActions.getProductsAction());
            },

            error: () => {
              this.snackBarService.open(
                this.translateService.instant(
                  'PRODUCTS_CATALOGUE_PAGE.DELETE_PRODUCT_DIALOG.ERROR_MESSAGE'
                ),
                this.translateService.instant('GENERAL_TEXTS.CLOSE')
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

  openTextOrderDialog() {
    this.bottomSheet.open(TextOrderComponent);
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
      // it means that the user just simplycanceled the dialog.
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
          this.snackBarService.open(
            this.translateService.instant(
              'PRODUCTS_CATALOGUE_PAGE.ALLOW_MANAGE_PRODUCT_DETAILS_DIALOG.SUCCESS_MESSAGE'
            ),
            this.translateService.instant('GENERAL_TEXTS.CLOSE')
          );
        } else {
          this.snackBarService.open(
            this.translateService.instant(
              'PRODUCTS_CATALOGUE_PAGE.ALLOW_MANAGE_PRODUCT_DETAILS_DIALOG.INVALID_USER_PRIVILEGE_MESSAGE'
            ),
            this.translateService.instant('GENERAL_TEXTS.CLOSE')
          );
        }
      } else {
        this.snackBarService.open(
          this.translateService.instant(
            'PRODUCTS_CATALOGUE_PAGE.ALLOW_MANAGE_PRODUCT_DETAILS_DIALOG.ERROR_MESSAGE'
          ),
          this.translateService.instant('GENERAL_TEXTS.CLOSE')
        );
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

  switchSaleAgent(e) {
    this.storageService.storeString('currentSalesAgentId', e.value.toString());
    this.currentSalesAgentId = e.value;
    this.store.dispatch(ProductActions.resetProductState());
    this.store.dispatch(
      ProductTransactionActions.initializeProductTransactions()
    );

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
        this.store.dispatch(ProductActions.getProductsAction());
        this.searchFieldComponent.clear();
      }
    })
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
}
