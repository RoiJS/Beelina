import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, map, startWith } from 'rxjs';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { productUnitsSelector } from 'src/app/units/store/selectors';

import { ProductService } from 'src/app/_services/product.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { isUpdateLoadingSelector } from '../store/selectors';

import { Product } from 'src/app/_models/product';
import { ProductUnit } from 'src/app/_models/product-unit';
import { ProductInformationResult } from 'src/app/_models/results/product-information-result';
import { UniqueProductCodeValidator } from 'src/app/_validators/unique-product-code.validator';

import * as ProductUnitActions from '../../units/store/actions';
import * as ProductActions from '../store/actions';

@Component({
  selector: 'app-edit-product-details',
  templateUrl: './edit-product-details.component.html',
  styleUrls: ['./edit-product-details.component.scss'],
})
export class EditProductDetailsComponent implements OnInit {
  private _productForm: FormGroup;
  private _productUnitOptions: Array<ProductUnit> = [];
  private _productUnitFilterOptions: Observable<Array<ProductUnit>>;
  private _productUnitOptionsSubscription: Subscription;
  private _productId: number;

  $isLoading: Observable<boolean>;

  constructor(
    private activatedRoute: ActivatedRoute,
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
        description: ['', Validators.required],
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

    this._productId = +this.activatedRoute.snapshot.paramMap.get('id');

    this.uniqueProductCodeValidator.productId = this._productId;

    this.productService
      .getProduct(this._productId)
      .subscribe((product: ProductInformationResult) => {
        this._productForm.get('name').setValue(product.name);
        this._productForm.get('code').setValue(product.code);
        this._productForm.get('description').setValue(product.description);
        this._productForm.get('stockQuantity').setValue(product.stockQuantity);
        this._productForm.get('pricePerUnit').setValue(product.price);
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
  }

  ngOnDestroy(): void {
    this._productUnitOptionsSubscription.unsubscribe();
    this.store.dispatch(ProductActions.resetProductState());
  }

  saveProduct() {
    const product = new Product();
    product.id = this._productId;
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
            this.productService.updateProductInformation(product).subscribe({
              next: () => {
                this.snackBarService.open(
                  this.translateService.instant(
                    'EDIT_PRODUCT_DETAILS_PAGE.EDIT_PRODUCT_DIALOG.SUCCESS_MESSAGE'
                  ),
                  this.translateService.instant('GENERAL_TEXTS.CLOSE')
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
                    'EDIT_PRODUCT_DETAILS_PAGE.EDIT_PRODUCT_DIALOG.ERROR_MESSAGE'
                  ),
                  this.translateService.instant('GENERAL_TEXTS.CLOSE')
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
