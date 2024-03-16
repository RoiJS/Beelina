import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, map, startWith } from 'rxjs';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { productUnitsSelector } from 'src/app/units/store/selectors';

import { ProductService } from 'src/app/_services/product.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';

import { isUpdateLoadingSelector } from '../store/selectors';

import { Product } from 'src/app/_models/product';
import { ProductUnit } from 'src/app/_models/product-unit';
import { ProductInformationResult } from 'src/app/_models/results/product-information-result';
import { UniqueProductCodeValidator } from 'src/app/_validators/unique-product-code.validator';

import { ProductSourceEnum } from 'src/app/_enum/product-source.enum';
import { InsufficientProductQuantity } from 'src/app/_models/insufficient-product-quantity';
import { AddProductStockQuantityDialogComponent } from '../add-product-stock-quantity-dialog/add-product-stock-quantity-dialog.component';

import * as ProductUnitActions from '../../units/store/actions';
import * as ProductActions from '../store/actions';

@Component({
  selector: 'app-edit-product-details',
  templateUrl: './edit-product-details.component.html',
  styleUrls: ['./edit-product-details.component.scss'],
})
export class EditProductDetailsComponent implements OnInit {
  private _dialogRef: MatBottomSheetRef<
    AddProductStockQuantityDialogComponent,
    {
      additionalStockQuantity: number;
      transactionNo: string;
    }
  >;
  private _productForm: FormGroup;
  private _productDetails: ProductInformationResult;
  private _productUnitOptions: Array<ProductUnit> = [];
  private _productUnitFilterOptions: Observable<Array<ProductUnit>>;
  private _productUnitOptionsSubscription: Subscription;
  private _productAdditionalStockQuantitySubscription: Subscription;
  private _productId: number;
  private _productSource: ProductSourceEnum;
  private _productSourceUpdateFunc: Array<string> = ["updateProductInformation", "updateWarehouseProductInformation"];
  private _productSourceGetFunc: Array<string> = ["getProduct", "getWarehouseProduct"];
  private _productSourceRedirectUrl: Array<string> = ['/product-catalogue', "/warehouse-products"];
  private _warehouseId: number = 1;

  $isLoading: Observable<boolean>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private bottomSheet: MatBottomSheet,
    private store: Store<AppStateInterface>,
    private dialogService: DialogService,
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private router: Router,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private uniqueProductCodeValidator: UniqueProductCodeValidator
  ) {
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
        numberOfUnits: [0]
      },
      {
        updateOn: 'blur',
      }
    );

    this.$isLoading = this.store.pipe(select(isUpdateLoadingSelector));
  }

  ngOnInit() {
    this.store.dispatch(ProductUnitActions.getProductUnitsAction());

    this._productId = +this.activatedRoute.snapshot.paramMap.get('id');

    this.uniqueProductCodeValidator.productId = this._productId;

    this.productService[this._productSourceGetFunc[this._productSource]](this._productId)
      .subscribe((product: ProductInformationResult) => {
        this._productDetails = product;
        this._productForm.get('name').setValue(product.name);
        this._productForm.get('code').setValue(product.code);
        this._productForm.get('description').setValue(product.description);
        this._productForm.get('stockQuantity').setValue(product.stockQuantity);
        this._productForm.get('pricePerUnit').setValue(product.price);
        this._productForm.get('isTransferable').setValue(product.isTransferable);
        this._productForm.get('numberOfUnits').setValue(product.numberOfUnits);
        this._productForm.get('productUnit').setValue(product.productUnit.name);
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

    this._productAdditionalStockQuantitySubscription = this._productForm
      .get('additionalStockQuantity')
      .valueChanges
      .subscribe((value) => {
        const newStockQuantity = value + this._productDetails.stockQuantity;
        this._productForm.get('stockQuantity').setValue(newStockQuantity);
      });
  }

  ngOnDestroy(): void {
    this._dialogRef = null;
    this._productUnitOptionsSubscription.unsubscribe();
    this._productAdditionalStockQuantitySubscription.unsubscribe();
    this.store.dispatch(ProductActions.resetProductState());
  }

  manageProductStockAudit() {
    this.router.navigate([`product-catalogue/edit-product/${this._productId}/manage-product-stock-audit`], { state: { productSource: this._productSource } });
  }

  saveProduct() {
    const product = new Product();
    product.id = this._productId;
    product.name = this._productForm.get('name').value;
    product.code = this._productForm.get('code').value;
    product.description = this._productForm.get('description').value;
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
            this.productService[this._productSourceUpdateFunc[this._productSource]]([product]).subscribe({
              next: () => {
                this.notificationService.openSuccessNotification(this.translateService.instant(
                  'EDIT_PRODUCT_DETAILS_PAGE.EDIT_PRODUCT_DIALOG.SUCCESS_MESSAGE'
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

          const updateAdditionalStockValue = () => {
            this._productForm
              .get('additionalStockQuantity')
              .setValue(data.additionalStockQuantity);

            this._productForm
              .get('transactionNo')
              .setValue(data.transactionNo);
          }

          if (this._productSource == ProductSourceEnum.Panel) {
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
}
