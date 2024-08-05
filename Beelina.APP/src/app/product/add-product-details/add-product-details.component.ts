import { Component, OnInit, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, map, startWith } from 'rxjs';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { ProductService } from 'src/app/_services/product.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';

import * as ProductUnitActions from '../../units/store/actions';
import * as ProductActions from '../store/actions';

import { productUnitsSelector } from 'src/app/units/store/selectors';
import { isUpdateLoadingSelector } from '../store/selectors';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';

import { ProductSourceEnum } from 'src/app/_enum/product-source.enum';
import { Product } from 'src/app/_models/product';
import { ProductUnit } from 'src/app/_models/product-unit';
import { UniqueProductCodeValidator } from 'src/app/_validators/unique-product-code.validator';
import { AddProductStockQuantityDialogComponent } from '../add-product-stock-quantity-dialog/add-product-stock-quantity-dialog.component';
import { SupplierStore } from 'src/app/suppliers/suppliers.store';

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
  notificationService = inject(NotificationService);
  uniqueProductCodeValidator = inject(UniqueProductCodeValidator);
  supplierStore = inject(SupplierStore);
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
    const product = new Product();
    product.name = this._productForm.get('name').value;
    product.code = this._productForm.get('code').value;
    product.description = this._productForm.get('description').value;
    product.supplierId = this._productForm.get('supplierId').value;
    product.stockQuantity = this._productForm.get('additionalStockQuantity').value;
    product.withdrawalSlipNo = this._productForm.get('transactionNo').value;
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
              next: () => {
                this.notificationService.openSuccessNotification(this.translateService.instant(
                  'ADD_PRODUCT_DETAILS_PAGE.SAVE_NEW_PRODUCT_DIALOG.SUCCESS_MESSAGE'
                ));
                this.store.dispatch(
                  ProductActions.setUpdateProductLoadingState({
                    state: false,
                  })
                );
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
  }

  editStockQuantity() {
    this._dialogRef = this.bottomSheet.open(AddProductStockQuantityDialogComponent, {
      data: {
        additionalStockQuantity: this._productForm.get('additionalStockQuantity').value,
        transactionNo: this._productForm.get('transactionNo').value,
        productSource: this._productSource,
      },
    });

    this._dialogRef
      .afterDismissed()
      .subscribe(
        (data: {
          additionalStockQuantity: number;
          transactionNo: string;
        }) => {
          if (!data) return;
          this._productForm
            .get('additionalStockQuantity')
            .setValue(data.additionalStockQuantity);
          this._productForm
            .get('transactionNo')
            .setValue(data.transactionNo);
        }
      );
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
