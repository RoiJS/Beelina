import { Component, OnInit, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, firstValueFrom, map, startWith } from 'rxjs';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { ProductService } from 'src/app/_services/product.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { LogMessageService } from 'src/app/_services/log-message.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { StorageService } from 'src/app/_services/storage.service';

import * as ProductUnitActions from '../../units/store/actions';
import * as ProductActions from '../store/actions';

import { productUnitsSelector } from 'src/app/units/store/selectors';
import { isUpdateLoadingSelector } from '../store/selectors';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { LogLevelEnum } from 'src/app/_enum/log-type.enum';

import { ProductSourceEnum } from 'src/app/_enum/product-source.enum';
import { Product } from 'src/app/_models/product';
import { ProductUnit } from 'src/app/_models/product-unit';
import { UniqueProductCodeValidator } from 'src/app/_validators/unique-product-code.validator';
import { AddProductStockQuantityDialogComponent } from '../add-product-stock-quantity-dialog/add-product-stock-quantity-dialog.component';
import { SupplierStore } from 'src/app/suppliers/suppliers.store';
import { ProductWarehouseStockReceiptEntry } from 'src/app/_models/product-warehouse-stock-receipt-entry';
import { ProductStockWarehouseAudit } from 'src/app/_models/product-stock-warehouse-audit';
import { StockAuditSourceEnum } from 'src/app/_enum/stock-audit-source.enum';
import { ProductWithdrawalEntry } from 'src/app/_models/product-withdrawal-entry';
import { ProductStockAudit } from 'src/app/_models/product-stock-audit';

@Component({
  selector: 'app-add-product-details',
  templateUrl: './add-product-details.component.html',
  styleUrls: ['./add-product-details.component.scss'],
})
export class AddProductDetailsComponent implements OnInit {
  private _dialogRef: MatBottomSheetRef<
    AddProductStockQuantityDialogComponent,
    {
      additionalStockQuantity: number;
      transactionNo: string;
    }
  >;
  private _productForm: FormGroup;
  private _productUnitOptions: Array<ProductUnit> = [];
  private _productUnitFilterOptions: Observable<Array<ProductUnit>>;
  private _productUnitOptionsSubscription: Subscription;
  private _productAdditionalStockQuantitySubscription: Subscription;
  private _productSource: ProductSourceEnum;
  private _productSourceUpdateFunc: Array<string> = ["updateProductInformation", "updateWarehouseProductInformation"];
  private _productSourceRedirectUrl: Array<string> = ['/product-catalogue', "/warehouse-products"];
  private _updateProductSubscription: Subscription;
  $isLoading: Observable<boolean>;

  bottomSheet = inject(MatBottomSheet);
  store = inject(Store<AppStateInterface>);
  dialogService = inject(DialogService);
  productService = inject(ProductService);
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  loggerService = inject(LogMessageService);
  notificationService = inject(NotificationService);
  uniqueProductCodeValidator = inject(UniqueProductCodeValidator);
  supplierStore = inject(SupplierStore);
  storageService = inject(StorageService);
  translateService = inject(TranslateService);

  suppliers = computed(() => this.supplierStore.suppliers());

  constructor() {
    const state = <any>this.router.getCurrentNavigation().extras.state;
    this._productSource = <ProductSourceEnum>state.productSource;

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
        additionalStockQuantity: [0],
        plateNo: [''],
        pricePerUnit: [null, Validators.required],
        productUnit: ['', Validators.required],
        isTransferable: [false],
        numberOfUnits: [0],
        supplierId: [null, Validators.required]
      },
      {
        updateOn: 'blur',
      }
    );

    this.$isLoading = this.store.pipe(select(isUpdateLoadingSelector));
    this.supplierStore.getAllSuppliers();
  }

  ngOnInit() {
    this.store.dispatch(ProductUnitActions.getProductUnitsAction());

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

    this._productAdditionalStockQuantitySubscription = this._productForm
      .get('additionalStockQuantity')
      .valueChanges
      .subscribe((value) => {
        const newStockQuantity = value + this._productForm.get('stockQuantity').value;
        this._productForm.get('stockQuantity').setValue(newStockQuantity);
      });
  }

  ngOnDestroy(): void {
    this._dialogRef = null;
    if (this._updateProductSubscription) this._updateProductSubscription.unsubscribe();
    this._productUnitOptionsSubscription.unsubscribe();
    this._productAdditionalStockQuantitySubscription.unsubscribe();
    this.store.dispatch(ProductActions.resetProductState());
  }

  saveProduct() {

    try {
      const product = new Product();
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
      product.productUnit.name = this._productForm.get('productUnit').value;

      this._productForm.markAllAsTouched();

      if (this._productForm.valid) {
        this.dialogService
          .openConfirmation(
            this.translateService.instant(
              'ADD_PRODUCT_DETAILS_PAGE.SAVE_NEW_PRODUCT_DIALOG.TITLE'
            ),
            this.translateService.instant(
              'ADD_PRODUCT_DETAILS_PAGE.SAVE_NEW_PRODUCT_DIALOG.CONFIRM'
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
                next: async (products: Array<Product>) => {
                  this.notificationService.openSuccessNotification(this.translateService.instant(
                    'ADD_PRODUCT_DETAILS_PAGE.SAVE_NEW_PRODUCT_DIALOG.SUCCESS_MESSAGE'
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
                      productStockWarehouseAudit.productId = products[0].id;
                      productStockWarehouseAudit.quantity = product.stockQuantity;
                      productStockWarehouseAudit.pricePerUnit = product.pricePerUnit;
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
                      productStockAudit.productId = products[0].id;
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
                    'ADD_PRODUCT_DETAILS_PAGE.SAVE_NEW_PRODUCT_DIALOG.ERROR_MESSAGE'
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
          plateNo: this._productForm.get('plateNo').value,
          productSource: this._productSource,
        },
      });

      this._dialogRef
        .afterDismissed()
        .subscribe(
          async (data: {
            additionalStockQuantity: number;
            transactionNo: string;
            plateNo: string;
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
                  'PRODUCT_WITHDRAWAL_DETAILS_PAGE.PRODUCT_WITHDRAWAL_GENERAL_INFO_PANEL.FORM_CONTROL_SECTION.PRODUCT_WITHDRAWAL_DETAILS_PAGE.ALREADY_EXIST_ERROR_MESSAGE'
                ))
                return;
              }
            }

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

  get productForm(): FormGroup {
    return this._productForm;
  }

  get productUnitFilterOptions(): Observable<Array<ProductUnit>> {
    return this._productUnitFilterOptions;
  }

  get productSource(): ProductSourceEnum {
    return this._productSource;
  }
}
