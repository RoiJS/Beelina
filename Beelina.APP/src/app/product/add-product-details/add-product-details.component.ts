import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable, startWith, Subscription } from 'rxjs';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { ProductService } from 'src/app/_services/product.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';

import * as ProductUnitActions from '../../units/store/actions';
import * as ProductActions from '../store/actions';

import { isUpdateLoadingSelector } from '../store/selectors';
import { productUnitsSelector } from 'src/app/units/store/selectors';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';

import { UniqueProductCodeValidator } from 'src/app/_validators/unique-product-code.validator';
import { ProductUnit } from 'src/app/_models/product-unit';
import { Product } from 'src/app/_models/product';
import { WithdrawalSlipNoDialogComponent } from '../withdrawal-slip-no-dialog/withdrawal-slip-no-dialog.component';

@Component({
  selector: 'app-add-product-details',
  templateUrl: './add-product-details.component.html',
  styleUrls: ['./add-product-details.component.scss'],
})
export class AddProductDetailsComponent implements OnInit {
  private _dialogRef: MatBottomSheetRef<
    WithdrawalSlipNoDialogComponent,
    {
      additionalStockQuantity: number;
      withdrawalSlipNo: string;
    }
  >;
  private _productForm: FormGroup;
  private _productUnitOptions: Array<ProductUnit> = [];
  private _productUnitFilterOptions: Observable<Array<ProductUnit>>;
  private _productUnitOptionsSubscription: Subscription;
  private _productAdditionalStockQuantitySubscription: Subscription;

  $isLoading: Observable<boolean>;

  constructor(
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
        withdrawalSlipNo: [''],
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
    this._productUnitOptionsSubscription.unsubscribe();
    this._productAdditionalStockQuantitySubscription.unsubscribe();
    this.store.dispatch(ProductActions.resetProductState());
  }

  saveProduct() {
    const product = new Product();
    product.name = this._productForm.get('name').value;
    product.code = this._productForm.get('code').value;
    product.description = this._productForm.get('description').value;
    product.stockQuantity = this._productForm.get('additionalStockQuantity').value;
    product.withdrawalSlipNo = this._productForm.get('withdrawalSlipNo').value;
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
            this.productService.updateProductInformation([product]).subscribe({
              next: () => {
                this.notificationService.openSuccessNotification(this.translateService.instant(
                  'ADD_PRODUCT_DETAILS_PAGE.SAVE_NEW_PRODUCT_DIALOG.SUCCESS_MESSAGE'
                ));
                this.store.dispatch(
                  ProductActions.setUpdateProductLoadingState({
                    state: false,
                  })
                );
                this.router.navigate(['/product-catalogue']);
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
    this._dialogRef = this.bottomSheet.open(WithdrawalSlipNoDialogComponent, {
      data: {
        additionalStockQuantity: this._productForm.get('additionalStockQuantity').value,
        withdrawalSlipNo: this._productForm.get('withdrawalSlipNo').value,
      },
    });

    this._dialogRef
      .afterDismissed()
      .subscribe(
        (data: {
          additionalStockQuantity: number;
          withdrawalSlipNo: string;
        }) => {
          this._productForm
            .get('additionalStockQuantity')
            .setValue(data.additionalStockQuantity);
          this._productForm
            .get('withdrawalSlipNo')
            .setValue(data.withdrawalSlipNo);
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
