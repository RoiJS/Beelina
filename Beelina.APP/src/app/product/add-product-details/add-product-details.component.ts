import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable, startWith, Subscription } from 'rxjs';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { ProductService } from 'src/app/_services/product.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';

import * as ProductUnitActions from '../../units/store/actions';
import * as ProductActions from '../store/actions';

import { isUpdateLoadingSelector } from '../store/selectors';
import { productUnitsSelector } from 'src/app/units/store/selectors';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';

import { UniqueProductCodeValidator } from 'src/app/_validators/unique-product-code.validator';
import { ProductUnit } from 'src/app/_models/product-unit';
import { Product } from 'src/app/_models/product';

@Component({
  selector: 'app-add-product-details',
  templateUrl: './add-product-details.component.html',
  styleUrls: ['./add-product-details.component.scss'],
})
export class AddProductDetailsComponent implements OnInit {
  private _productForm: FormGroup;
  private _productUnitOptions: Array<ProductUnit> = [];
  private _productUnitFilterOptions: Observable<Array<ProductUnit>>;
  private _productUnitOptionsSubscription: Subscription;

  $isLoading: Observable<boolean>;

  constructor(
    private store: Store<AppStateInterface>,
    private dialogService: DialogService,
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBarService: MatSnackBar,
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
        stockQuantity: [null, [Validators.required, Validators.min(1)]],
        pricePerUnit: [null, Validators.required],
        productUnit: ['', Validators.required],
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
  }

  ngOnDestroy(): void {
    this._productUnitOptionsSubscription.unsubscribe();
    this.store.dispatch(ProductActions.resetProductState());
  }

  saveProduct() {
    const product = new Product();
    product.name = this._productForm.get('name').value;
    product.code = this._productForm.get('code').value;
    product.description = this._productForm.get('description').value;
    product.stockQuantity = this._productForm.get('stockQuantity').value;
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
            this.productService.updateProductInformation(product).subscribe({
              next: () => {
                this.snackBarService.open(
                  this.translateService.instant(
                    'ADD_PRODUCT_DETAILS_PAGE.SAVE_NEW_PRODUCT_DIALOG.SUCCESS_MESSAGE'
                  ),
                  this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                  {
                    duration: 5000,
                  }
                );
                this.store.dispatch(
                  ProductActions.setUpdateProductLoadingState({
                    state: false,
                  })
                );
                this.router.navigate(['/product-catalogue']);
              },

              error: () => {
                this.snackBarService.open(
                  this.translateService.instant(
                    'ADD_PRODUCT_DETAILS_PAGE.SAVE_NEW_PRODUCT_DIALOG.ERROR_MESSAGE'
                  ),
                  this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                  {
                    duration: 5000,
                  }
                );

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
