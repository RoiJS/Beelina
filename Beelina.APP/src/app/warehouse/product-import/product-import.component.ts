import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FilePickerComponent, UploadResponse, ValidationError } from 'ngx-awesome-uploader';


import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { IFailedExtractedProductPayload } from 'src/app/_interfaces/payloads/ifailed-product-import.payload';
import { IMapExtractedProductPayload } from 'src/app/_interfaces/payloads/imap-product-import.payload';
import { Product } from 'src/app/_models/product';

import * as ProductActions from '../store/actions';
import { importResultSelector, isImportLoadingSelector, isLoadingSelector } from '../store/selectors';

import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { LoaderLayoutComponent } from 'src/app/shared/ui/loader-layout/loader-layout.component';

import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { ProductService } from 'src/app/_services/product.service';

import { WarehouseFilePickerAdapter } from '../warehouse-file-picker.adapter';

@Component({
  selector: 'app-product-import',
  templateUrl: './product-import.component.html',
  styleUrls: ['./product-import.component.scss']
})
export class ProductImportComponent extends BaseComponent implements OnInit, OnDestroy {
  warehouseFilePickerAdapter = new WarehouseFilePickerAdapter(this.productService);

  @ViewChild(MatStepper) stepper: MatStepper;
  @ViewChild(FilePickerComponent) filePicker: FilePickerComponent;
  @ViewChild(LoaderLayoutComponent) loader: LoaderLayoutComponent;
  @ViewChild('successProductImportPaginator', { static: true }) successProductImportPaginator: MatPaginator;
  @ViewChild('failedProductImportPaginator', { static: true }) failedProductImportPaginator: MatPaginator;
  private _successProductsImportsDatasource = new MatTableDataSource<IMapExtractedProductPayload>([]);
  private _failedProductsImportsDatasource = new MatTableDataSource<IFailedExtractedProductPayload>([]);
  $isExtractionLoading: Observable<boolean>;
  $isImportLoading: Observable<boolean>;

  constructor(
    private productService: ProductService,
    private store: Store<AppStateInterface>,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    public translateService: TranslateService,
  ) {
    super();
    this.$isExtractionLoading = this.store.pipe(select(isLoadingSelector));
    this.$isImportLoading = this.store.pipe(select(isImportLoadingSelector));
  }

  ngOnInit() {
    this.store.pipe(select(importResultSelector))
      .subscribe((importResult: boolean) => {
        if (importResult) {
          this.notificationService.openSuccessNotification(this.translateService.instant('WAREHOUSE_PRODUCT_IMPORT_PAGE.SUCCESS_IMPORT_DIALOG.TEXT'));
          this.resetAction();
        }
      });
  }

  ngOnDestroy() {
    this.store.dispatch(ProductActions.importWarehouseProductsCancelAction());
  }

  ngAfterViewInit() {
    this._successProductsImportsDatasource.paginator = this.successProductImportPaginator;
    this._failedProductsImportsDatasource.paginator = this.failedProductImportPaginator;
  }

  onValidationError(e: ValidationError) {
    if (e.error === 'EXTENSIONS') {
      this.dialogService.openAlert(
        this.translateService.instant('WAREHOUSE_PRODUCT_IMPORT_PAGE.UPLOAD_FILE_VALIDATION_DIALOG.EXTENSION_ERROR_DIALOG.TITLE'),
        this.translateService.instant('WAREHOUSE_PRODUCT_IMPORT_PAGE.UPLOAD_FILE_VALIDATION_DIALOG.EXTENSION_ERROR_DIALOG.DESCRIPTION')
      );
    }

    if (e.error === 'UPLOAD_TYPE') {
      this.dialogService.openAlert(
        this.translateService.instant('WAREHOUSE_PRODUCT_IMPORT_PAGE.UPLOAD_FILE_VALIDATION_DIALOG.SELECT_ERROR_DIALOG.TITLE'),
        this.translateService.instant('WAREHOUSE_PRODUCT_IMPORT_PAGE.UPLOAD_FILE_VALIDATION_DIALOG.SELECT_ERROR_DIALOG.DESCRIPTION')
      );
    }
  }

  extractFile() {
    this.store.dispatch(ProductActions.setUpdateWarehouseProductLoadingState({ state: true }));
    const item = this.filePicker.files;
    this.loader.label = this.translateService.instant('WAREHOUSE_PRODUCT_IMPORT_PAGE.IMPORT_PRODUCTS_SECTION.FIRST_STEP_SECTION.EXTRACT_PROCESS_TEXT');
    this.filePicker.adapter.uploadFile(item[0]).subscribe({
      next: (result: UploadResponse) => {
        this.store.dispatch(ProductActions.setUpdateWarehouseProductLoadingState({ state: false }));
        const data = result.body;
        this._successProductsImportsDatasource.data = data.successExtractedProducts;
        this._failedProductsImportsDatasource.data = data.failedExtractedProducts;
        this.stepper.next();
      },
      error: (e) => {
        this.store.dispatch(ProductActions.setUpdateWarehouseProductLoadingState({ state: false }));
        this.dialogService.openAlert(this.translateService.instant('WAREHOUSE_PRODUCT_IMPORT_PAGE.UPLOAD_FILE_VALIDATION_DIALOG.EXTRACT_FILE_ERROR_DIALOG.TITLE'), e.message);
        this.filePicker.removeFileFromList(item[0]);
      }
    });
  }

  importProducts() {
    const products = this._successProductsImportsDatasource.data.map((extractedProduct: IMapExtractedProductPayload) => {
      const product = new Product();
      product.id = extractedProduct.id;
      product.name = extractedProduct.name;
      product.code = extractedProduct.code;
      product.description = extractedProduct.description;
      product.stockQuantity = extractedProduct.quantity;
      product.isTransferable = extractedProduct.isTransferable;
      product.numberOfUnits = extractedProduct.numberOfUnits || extractedProduct.originalNumberOfUnits;
      product.pricePerUnit = extractedProduct.price || extractedProduct.originalPrice;
      product.productUnit.name = extractedProduct.unit || extractedProduct.originalUnit;
      return product;
    });

    if (products.length === 0) return;

    this.store.dispatch(ProductActions.importWarehouseProductsAction({ products }));
  }

  abortImport() {
    this.store.dispatch(ProductActions.importWarehouseProductsCancelAction());
    this.notificationService.openErrorNotification('Import process has been aborted. No products have been imported to the system.');
  }

  resetImport() {
    this.dialogService
      .openConfirmation('Reset import', 'Resetting import setup will remove the uploaded file and remove the extracted products as well. Are you sure you want to proceed?')
      .subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this.resetAction();
        }
      });
  }

  resetAction() {
    const item = this.filePicker.files;
    this.filePicker.removeFileFromList(item[0]);
    this._successProductsImportsDatasource.data = [];
    this._failedProductsImportsDatasource.data = [];
    this.stepper.reset();
  }

  get successProductImportsDatasource(): MatTableDataSource<IMapExtractedProductPayload> {
    return this._successProductsImportsDatasource;
  }

  get failedProductImportsDatasource(): MatTableDataSource<IFailedExtractedProductPayload> {
    return this._failedProductsImportsDatasource;
  }

  get successProductImportColumns(): string[] {
    return ['status', 'code', 'name', 'quantity', 'unit', 'price', 'numberOfUnits'];
  }

  get failedProductImportColumns(): string[] {
    return ['rowNumber', 'message'];
  }
}
