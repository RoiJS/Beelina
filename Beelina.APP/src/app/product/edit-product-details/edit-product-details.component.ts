import { Component, OnInit, OnDestroy, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, Subject, firstValueFrom, map, startWith, switchMap, debounceTime, distinctUntilChanged, takeUntil, tap, of, first } from 'rxjs';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { productUnitsSelector } from 'src/app/units/store/selectors';

import { AuthService } from 'src/app/_services/auth.service';
import { ProductService } from 'src/app/_services/product.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { LogMessageService } from 'src/app/_services/log-message.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { StorageService } from 'src/app/_services/storage.service';

import { isUpdateLoadingSelector } from '../store/selectors';

import { Product } from 'src/app/_models/product';
import { ProductUnit } from 'src/app/_models/product-unit';
import { ProductInformationResult } from 'src/app/_models/results/product-information-result';
import { UniqueProductCodeValidator } from 'src/app/_validators/unique-product-code.validator';

import { BusinessModelEnum } from 'src/app/_enum/business-model.enum';
import { LogLevelEnum } from 'src/app/_enum/log-type.enum';
import { ModuleEnum } from 'src/app/_enum/module.enum';
import { ProductSourceEnum } from 'src/app/_enum/product-source.enum';
import { PermissionLevelEnum } from 'src/app/_enum/permission-level.enum';

import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { AddProductStockQuantityDialogComponent } from '../add-product-stock-quantity-dialog/add-product-stock-quantity-dialog.component';
import { SalesAgentSelectorDialogComponent, SalesAgentSelectorConfig } from 'src/app/shared/components/sales-agent-selector-dialog';
import { SupplierStore } from 'src/app/suppliers/suppliers.store';
import { InsufficientProductQuantity } from 'src/app/_models/insufficient-product-quantity';

import * as ProductUnitActions from '../../units/store/actions';
import * as ProductActions from '../store/actions';
import { ProductWarehouseStockReceiptEntry } from 'src/app/_models/product-warehouse-stock-receipt-entry';
import { ProductStockWarehouseAudit } from 'src/app/_models/product-stock-warehouse-audit';
import { StockAuditSourceEnum } from 'src/app/_enum/stock-audit-source.enum';
import { ProductWithdrawalEntry } from 'src/app/_models/product-withdrawal-entry';
import { ProductStockAudit } from 'src/app/_models/product-stock-audit';

@Component({
  selector: 'app-edit-product-details',
  templateUrl: './edit-product-details.component.html',
  styleUrls: ['./edit-product-details.component.scss'],
})
export class EditProductDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
  private _dialogRef: MatBottomSheetRef<
    AddProductStockQuantityDialogComponent,
    {
      additionalStockQuantity: number;
      plateNo: string;
      transactionNo: string;
    }
  >;
  private _productForm: FormGroup;
  private _productDetails: ProductInformationResult;
  private _productUnitOptions: Array<ProductUnit> = [];
  private _productUnitFilterOptions: Observable<Array<ProductUnit>>;
  private _productUnitOptionsSubscription: Subscription;
  private _destroy$ = new Subject<void>();
  private _filteredParentProducts$: Observable<Product[]>;
  private _productAdditionalStockQuantitySubscription: Subscription;
  private _productId: number;
  private _productSource: ProductSourceEnum;
  private _businessModel: BusinessModelEnum;
  private _productSourceUpdateFunc: Array<string> = ["updateProductInformation", "updateWarehouseProductInformation"];
  private _productSourceGetFunc: Array<string> = ["getProduct", "getWarehouseProduct"];
  private _productSourceRedirectUrl: Array<string> = ['/product-catalogue', "/warehouse-products"];
  private _updateProductSubscription: Subscription;
  private _warehouseId: number = 1;
  private _isAdmin = false;
  private _productInformationLabelText: string;
  private _productConnectionLabelText: string;
  private _productValidityLabelText: string;
  private _isParentSwitchDisabled: boolean = false;

  // Expose enum to template
  readonly ProductSourceEnum = ProductSourceEnum;

  get productSource(): ProductSourceEnum {
    return this._productSource;
  }

  activatedRoute = inject(ActivatedRoute);
  authService = inject(AuthService);
  bottomSheet = inject(MatBottomSheet);
  store = inject(Store<AppStateInterface>);
  dialogService = inject(DialogService);
  productService = inject(ProductService);
  formBuilder = inject(FormBuilder);
  loggerService = inject(LogMessageService);
  router = inject(Router);
  notificationService = inject(NotificationService);
  uniqueProductCodeValidator = inject(UniqueProductCodeValidator);
  supplierStore = inject(SupplierStore);
  storageService = inject(StorageService);
  translateService = inject(TranslateService);

  suppliers = computed(() => this.supplierStore.suppliers());

  constructor() {
    super();
    this._currentLoggedInUser = this.authService.user.value;
    this._isAdmin = this.modulePrivilege(ModuleEnum.Distribution) === this.getPermissionLevel(PermissionLevelEnum.Administrator);

    const state = <any>this.router.getCurrentNavigation().extras.state;
    this._productSource = <ProductSourceEnum>state.productSource;
    this._businessModel = this.authService.businessModel;

    this._productInformationLabelText = this.translateService.instant('EDIT_PRODUCT_DETAILS_PAGE.TAB_SECTIONS.PRODUCT_INFORMATION');
    this._productConnectionLabelText = this.translateService.instant('EDIT_PRODUCT_DETAILS_PAGE.TAB_SECTIONS.PRODUCT_CONNECTION');
    this._productValidityLabelText = this.translateService.instant('EDIT_PRODUCT_DETAILS_PAGE.TAB_SECTIONS.PRODUCT_VALIDITY');

    this._productForm = this.formBuilder.group(
      {
        code: [
          '',
          [Validators.required],
          [
            this.uniqueProductCodeValidator.validate.bind(
              this.uniqueProductCodeValidator
            ),
          ],
        ],
        name: ['', Validators.required],
        description: [''],
        transactionNo: [''],
        stockQuantity: [0],
        stocksRemainingFromWarehouse: [0],
        additionalStockQuantity: [0],
        plateNo: [''],
        pricePerUnit: [null, Validators.required],
        costPrice: [0],
        productUnit: ['', Validators.required],
        isTransferable: [false],
        numberOfUnits: [0],
        supplierId: [null, Validators.required],
        validFrom: [null],
        validTo: [null],
        parent: [false],
        productParentGroupId: [null],
        productParentGroupDisplay: ['']
      },
    );

    this.$isLoading = this.store.pipe(select(isUpdateLoadingSelector));
    this.supplierStore.getAllSuppliers();
  }

  ngOnInit() {
    this.store.dispatch(ProductUnitActions.resetProductUnitsActionError());
    this.store.dispatch(ProductUnitActions.getProductUnitsAction());

    this._productId = +this.activatedRoute.snapshot.paramMap.get('id');

    this.uniqueProductCodeValidator.productId = this._productId;

    this.productService[this._productSourceGetFunc[this._productSource]](this._productId)
      .subscribe((product: ProductInformationResult) => {
        this._productDetails = product;
        this._productForm.get('name').setValue(product.name);
        this._productForm.get('code').setValue(product.code);
        this._productForm.get('description').setValue(product.description);
        this._productForm.get('supplierId').setValue(product.supplierId);
        this._productForm.get('stocksRemainingFromWarehouse').setValue(product.stocksRemainingFromWarehouse);
        this._productForm.get('stockQuantity').setValue(product.stockQuantity);
        this._productForm.get('isTransferable').setValue(product.isTransferable);
        this._productForm.get('numberOfUnits').setValue(product.numberOfUnits);
        this._productForm.get('productUnit').setValue(product.productUnit.name);
        this._productForm.get('validFrom').setValue(product.validFrom);
        this._productForm.get('validTo').setValue(product.validTo);
        this._productForm.get('parent').setValue(product.parent);
        this._productForm.get('productParentGroupId').setValue(product.productParentGroupId);

        // Set display value for parent product autocomplete
        if (product.productParentGroupId) {
          // Get the specific parent product for display using efficient single product fetch
          this.productService[this._productSourceGetFunc[this._productSource]](product.productParentGroupId)
            .pipe(
              first(),
              takeUntil(this._destroy$)
            )
            .subscribe({
              next: (parentProduct: ProductInformationResult) => {
                if (parentProduct) {
                  this._productForm.get('productParentGroupDisplay').setValue(parentProduct);
                }
              },
              error: (error) => {
                console.warn('Failed to load parent product:', error);
                // Optionally show a notification or log the error
                this.loggerService.logMessage(LogLevelEnum.ERROR, 'Failed to load parent product: ' + error);
              }
            });
        }

        // Check if product has linked products to disable parent switch
        if (product.parent) {
          this.productService.hasLinkedProducts(product.id)
            .pipe(
              first(),
              takeUntil(this._destroy$)
            )
            .subscribe({
              next: (hasLinkedProducts: boolean) => {
                if (hasLinkedProducts) {
                  this._productForm.get('parent').disable();
                  this._isParentSwitchDisabled = true;
                }
              },
              error: (error) => {
                console.warn('Failed to check linked products:', error);
                this.loggerService.logMessage(LogLevelEnum.ERROR, 'Failed to check linked products: ' + error);
              }
            });
        }

        if (this.showDefaultPrice) {
          this._productForm.get('pricePerUnit').setValue(product?.defaultPrice);
        } else {
          this._productForm.get('pricePerUnit').setValue(product.price);
        }
        this._productForm.get('costPrice').setValue(product.cost);
      });

    this._productUnitOptionsSubscription = this.store
      .pipe(select(productUnitsSelector))
      .subscribe((productUnits: Array<ProductUnit>) => {
        this._productUnitOptions = productUnits;
      });

    this._productUnitFilterOptions = this._productForm
      .get('productUnit')
      .valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(value || ''))
      );

    // Setup parent product autocomplete with server-side search
    this._filteredParentProducts$ = this._productForm
      .get('productParentGroupDisplay')!
      .valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        tap((value: string | Product) => {
          // Handle selection of a product object
          if (value && typeof value === 'object' && value.id) {
            this._productForm.get('productParentGroupId')?.setValue(value.id);
          }
        }),
        switchMap((value: string | Product) => {
          const searchTerm = typeof value === 'string' ? value : value?.name || '';

          if (searchTerm.length < 1) {
            return of([]);
          }

          return this.productService.getParentProducts(searchTerm).pipe(
            map(result => result || []),
            takeUntil(this._destroy$)
          );
        })
      );

    this._productAdditionalStockQuantitySubscription = this._productForm
      .get('additionalStockQuantity')
      .valueChanges
      .subscribe((value) => {
        const newStockQuantity = value + this._productDetails.stockQuantity;
        const newStockRemainingQuantity = this._productDetails.stocksRemainingFromWarehouse - value;

        this._productForm.get('stockQuantity').setValue(newStockQuantity);
        this._productForm.get('stocksRemainingFromWarehouse').setValue(newStockRemainingQuantity);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._dialogRef = null;
    if (this._updateProductSubscription) this._updateProductSubscription.unsubscribe();
    this._productUnitOptionsSubscription.unsubscribe();
    this._productAdditionalStockQuantitySubscription.unsubscribe();
    this.store.dispatch(ProductActions.resetProductState());
  }

  manageProductStockAudit() {
    this.router.navigate([`product-catalogue/edit-product/${this._productId}/manage-product-stock-audit`], { state: { productSource: this._productSource } });
  }

  saveProduct() {

    try {
      const product = new Product();
      product.id = this._productId;
      product.name = this._productForm.get('name').value;
      product.code = this._productForm.get('code').value;
      product.description = this._productForm.get('description').value;
      product.supplierId = this._productForm.get('supplierId').value;
      product.stockQuantity = this._productForm.get('additionalStockQuantity').value;
      product.withdrawalSlipNo = this._productForm.get('transactionNo').value;
      product.plateNo = this._productForm.get('plateNo').value;
      product.isTransferable = this._productForm.get('isTransferable').value;
      product.numberOfUnits = this._productForm.get('numberOfUnits').value;
      product.pricePerUnit = this._productForm.get('pricePerUnit').value;
      product.costPrice = this._productForm.get('costPrice').value;
      product.productUnit.name = this._productForm.get('productUnit').value;
      product.validFrom = this._productForm.get('validFrom').value;
      product.validTo = this._productForm.get('validTo').value;
      product.parent = this._productForm.get('parent').value;
      product.productParentGroupId = this._productForm.get('productParentGroupId').value;

      if (product.parent) {
        product.productParentGroupId = null;
      }

      this._productForm.markAllAsTouched();

      if (this._productForm.valid) {
        this.dialogService
          .openConfirmation(
            this.translateService.instant(
              'EDIT_PRODUCT_DETAILS_PAGE.EDIT_PRODUCT_DIALOG.TITLE'
            ),
            this.translateService.instant(
              'EDIT_PRODUCT_DETAILS_PAGE.EDIT_PRODUCT_DIALOG.CONFIRM'
            )
          )
          .subscribe((result: ButtonOptions) => {
            if (result === ButtonOptions.YES) {
              this.store.dispatch(
                ProductActions.setUpdateProductLoadingState({
                  state: true,
                })
              );
              this._updateProductSubscription = this.productService[this._productSourceUpdateFunc[this._productSource]]([product]).subscribe({
                next: async () => {
                  this.notificationService.openSuccessNotification(this.translateService.instant(
                    'EDIT_PRODUCT_DETAILS_PAGE.EDIT_PRODUCT_DIALOG.SUCCESS_MESSAGE'
                  ));
                  this.store.dispatch(
                    ProductActions.setUpdateProductLoadingState({
                      state: false,
                    })
                  );

                  if (this._productSource === ProductSourceEnum.Warehouse) {

                    if (product.stockQuantity > 0) {
                      const purchaseOrder = new ProductWarehouseStockReceiptEntry();
                      purchaseOrder.id = 0;
                      purchaseOrder.supplierId = product.supplierId;
                      purchaseOrder.stockEntryDate = new Date();
                      purchaseOrder.referenceNo = product.withdrawalSlipNo;
                      purchaseOrder.plateNo = product.plateNo;

                      const productStockWarehouseAudit = new ProductStockWarehouseAudit();
                      productStockWarehouseAudit.id = 0;
                      productStockWarehouseAudit.productId = this._productId;
                      productStockWarehouseAudit.quantity = product.stockQuantity;
                      productStockWarehouseAudit.pricePerUnit = product.pricePerUnit;
                      productStockWarehouseAudit.costPrice = product.costPrice;
                      productStockWarehouseAudit.stockAuditSource = StockAuditSourceEnum.OrderFromSupplier;

                      purchaseOrder.productStockWarehouseAuditInputs = [productStockWarehouseAudit];

                      await firstValueFrom(this.productService.updateWarehouseStockReceiptEntries([purchaseOrder]));
                    }
                  } else {
                    if (product.stockQuantity > 0) {
                      const productWithdrawal = new ProductWithdrawalEntry();
                      productWithdrawal.id = 0;
                      productWithdrawal.userAccountId = +this.storageService.getString('currentSalesAgentId');
                      productWithdrawal.stockEntryDate = new Date();
                      productWithdrawal.withdrawalSlipNo = product.withdrawalSlipNo;

                      const productStockAudit = new ProductStockAudit();
                      productStockAudit.id = 0;
                      productStockAudit.productId = this._productId;
                      productStockAudit.quantity = product.stockQuantity;
                      productStockAudit.pricePerUnit = product.pricePerUnit;
                      productStockAudit.stockAuditSource = StockAuditSourceEnum.FromWithdrawal;

                      productWithdrawal.productStockAudits = [productStockAudit];

                      await firstValueFrom(this.productService.updateProductWithdrawalEntries([productWithdrawal]));
                    }
                  }

                  this.router.navigate([this._productSourceRedirectUrl[this._productSource]]);
                },

                error: () => {
                  this.notificationService.openErrorNotification(this.translateService.instant(
                    'EDIT_PRODUCT_DETAILS_PAGE.EDIT_PRODUCT_DIALOG.ERROR_MESSAGE'
                  ));

                  this.store.dispatch(
                    ProductActions.setUpdateProductLoadingState({
                      state: false,
                    })
                  );
                },
              });
            }
          });
      }

    } catch (ex) {
      console.error(ex);
      this.loggerService.logMessage(LogLevelEnum.ERROR, ex);
    }

  }

  editStockQuantity() {

    try {
      this._dialogRef = this.bottomSheet.open(AddProductStockQuantityDialogComponent, {
        data: {
          additionalStockQuantity: this._productForm.get('additionalStockQuantity').value,
          transactionNo: this._productForm.get('transactionNo').value,
          PlaceholderEntitiesComponent: this._productForm.get('plateNo').value,
          productSource: this._productSource,
        },
      });

      this._dialogRef
        .afterDismissed()
        .subscribe(
          async (data: {
            additionalStockQuantity: number;
            plateNo: string;
            transactionNo: string;
          }) => {
            if (!data) return;

            if (this._productSource === ProductSourceEnum.Warehouse) {
              const checkPurchaseOrderCodeExists = await firstValueFrom(this.productService.checkPurchaseOrderCodeExists(0, data.transactionNo));

              if (checkPurchaseOrderCodeExists) {
                this.notificationService.openErrorNotification(this.translateService.instant(
                  'PURCHASE_ORDER_DETAILS_PAGE.PURCHASE_ORDER_GENERAL_INFO_PANEL.FORM_CONTROL_SECTION.REFERENCE_NO_CONTROL.ALREADY_EXIST_ERROR_MESSAGE'
                ))
                return;
              }
            } else {
              const checkProductWithdrawalCodeExists = await firstValueFrom(this.productService.checkProductWithdrawalCodeExists(0, data.transactionNo));

              if (checkProductWithdrawalCodeExists) {
                this.notificationService.openErrorNotification(this.translateService.instant(
                  'PRODUCT_WITHDRAWAL_DETAILS_PAGE.PRODUCT_WITHDRAWAL_GENERAL_INFO_PANEL.FORM_CONTROL_SECTION.WITHDRAWAL_SLIP_NO_CONTROL.ALREADY_EXIST_ERROR_MESSAGE'
                ))
                return;
              }
            }

            const updateAdditionalStockValue = () => {
              this._productForm
                .get('additionalStockQuantity')
                .setValue(data.additionalStockQuantity);

              this._productForm
                .get('transactionNo')
                .setValue(data.transactionNo);

              this._productForm
                .get('plateNo')
                .setValue(data.plateNo);
            }

            if (this._productSource === ProductSourceEnum.Panel) {
              this.productService
                .checkWarehouseProductStockQuantity(this._productId, this._warehouseId, data.additionalStockQuantity)
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
                    updateAdditionalStockValue();
                  }
                });
            } else {
              updateAdditionalStockValue();
            }
          }
        );
    } catch (ex) {
      console.error(ex);
      this.loggerService.logMessage(LogLevelEnum.ERROR, ex);
    }
  }

  private _filter(value: string): Array<ProductUnit> {
    const filterValue = value?.toLowerCase();

    return this._productUnitOptions.filter((option) =>
      option.name?.toLowerCase().includes(filterValue)
    );
  }

  displayParentProduct(product: Product): string {
    return product ? `${product.code}: ${product.name}` : '';
  }

  assignProduct() {
    try {
      const config: SalesAgentSelectorConfig = {
        title: this.translateService.instant('ASSIGN_PRODUCT_DIALOG.TITLE'),
        subtitle: this.translateService.instant('ASSIGN_PRODUCT_DIALOG.SUBTITLE'),
        searchPlaceholder: this.translateService.instant('ASSIGN_PRODUCT_DIALOG.SEARCH_PLACEHOLDER'),
        confirmButtonText: this.translateService.instant('ASSIGN_PRODUCT_DIALOG.ASSIGN_BUTTON'),
        allowMultipleSelection: true,
        preselectedAgentIds: [],
        excludeAgentIds: []
      };

      const dialogRef = this.bottomSheet.open(SalesAgentSelectorDialogComponent, {
        data: config,
        disableClose: false,
        hasBackdrop: true,
        panelClass: 'assign-product-dialog'
      });

      dialogRef.afterDismissed()
        .subscribe((selectedAgentIds: number[]) => {
          if (selectedAgentIds && selectedAgentIds.length > 0) {
            this.confirmAssignment(selectedAgentIds);
          }
        });
    } catch (error) {
      console.error('Error opening assign product dialog:', error);
      this.loggerService.logMessage(LogLevelEnum.ERROR, 'Error opening assign product dialog: ' + error);
    }
  }

  private confirmAssignment(salesAgentIds: number[]) {
    const agentCount = salesAgentIds.length;
    const productName = this._productDetails?.name || 'product';

    this.dialogService
      .openConfirmation(
        this.translateService.instant('ASSIGN_PRODUCT_DIALOG.CONFIRM_TITLE'),
        this.translateService.instant('ASSIGN_PRODUCT_DIALOG.CONFIRM_MESSAGE', {
          productName,
          agentCount
        })
      )
      .subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this.performAssignment(salesAgentIds);
        }
      });
  }

  private performAssignment(salesAgentIds: number[]) {
    this.store.dispatch(
      ProductActions.setUpdateProductLoadingState({ state: true })
    );

    this.productService.assignProductToSalesAgents(
      this._productId,
      salesAgentIds,
      this._warehouseId
    ).subscribe({
      next: (assignments) => {
        this.store.dispatch(
          ProductActions.setUpdateProductLoadingState({ state: false })
        );

        const assignmentCount = assignments.length;
        this.notificationService.openSuccessNotification(
          this.translateService.instant('ASSIGN_PRODUCT_DIALOG.SUCCESS_MESSAGE', {
            count: assignmentCount
          })
        );
      },
      error: (error) => {
        this.store.dispatch(
          ProductActions.setUpdateProductLoadingState({ state: false })
        );

        this.notificationService.openErrorNotification(
          this.translateService.instant('ASSIGN_PRODUCT_DIALOG.ERROR_MESSAGE')
        );

        this.loggerService.logMessage(
          LogLevelEnum.ERROR,
          `Failed to assign product ${this._productId}: ${error.message}`
        );
      }
    });
  }

  get productForm(): FormGroup {
    return this._productForm;
  }

  get productUnitFilterOptions(): Observable<Array<ProductUnit>> {
    return this._productUnitFilterOptions;
  }

  get parentProductFilterOptions(): Observable<Array<Product>> {
    return this._filteredParentProducts$;
  }

  get showDefaultPrice(): boolean {
    return this._productDetails?.defaultPrice > 0 && this._productSource === ProductSourceEnum.Panel;
  }

  get businessModel(): BusinessModelEnum {
    return this._businessModel;
  }

  get isAdmin(): boolean {
    return this._isAdmin;
  }

  get productInformationLabelText(): string {
    return this._productInformationLabelText;
  }

  get productConnectionLabelText(): string {
    return this._productConnectionLabelText;
  }

  get productValidityLabelText(): string {
    return this._productValidityLabelText;
  }

  get isParentSwitchDisabled(): boolean {
    return this._isParentSwitchDisabled;
  }

  override get businessModelEnum(): typeof BusinessModelEnum {
    return BusinessModelEnum;
  }
}
