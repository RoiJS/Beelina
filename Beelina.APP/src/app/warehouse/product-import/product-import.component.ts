import { Component, OnDestroy, OnInit, inject, viewChild } from '@angular/core';
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
import { LogMessageService } from 'src/app/_services/log-message.service';

import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { ProductService } from 'src/app/_services/product.service';

import { WarehouseFilePickerAdapter } from '../warehouse-file-picker.adapter';
import { LogLevelEnum } from 'src/app/_enum/log-type.enum';

@Component({
  selector: 'app-product-import',
  templateUrl: './product-import.component.html',
  styleUrls: ['./product-import.component.scss']
})
export class ProductImportComponent extends BaseComponent implements OnInit, OnDestroy {

  stepper = viewChild(MatStepper);
  filePicker = viewChild(FilePickerComponent);
  loader = viewChild(LoaderLayoutComponent);
  loggerService = inject(LogMessageService);
  successProductImportPaginator = viewChild<MatPaginator>('successProductImportPaginator');
  failedProductImportPaginator = viewChild<MatPaginator>('failedProductImportPaginator');

  successProductsImportsDatasource = new MatTableDataSource<IMapExtractedProductPayload>([]);
  failedProductsImportsDatasource = new MatTableDataSource<IFailedExtractedProductPayload>([]);
  $isExtractionLoading: Observable<boolean>;
  $isImportLoading: Observable<boolean>;

  productService = inject(ProductService);
  store = inject(Store<AppStateInterface>);
  dialogService = inject(DialogService);
  notificationService = inject(NotificationService);
  translateService = inject(TranslateService);

  warehouseFilePickerAdapter = new WarehouseFilePickerAdapter(this.productService);

  constructor() {
    super();
    this.$isExtractionLoading = this.store.pipe(select(isLoadingSelector));
    this.$isImportLoading = this.store.pipe(select(isImportLoadingSelector));
  }

  ngOnInit() {
    this.store.pipe(select(importResultSelector))
      .subscribe((importResult: boolean) => {
        if (importResult) {
          this.notificationService.openSuccessNotification(this.translateService.instant('WAREHOUSE_PRODUCT_IMPORT_PAGE.SUCCESS_IMPORT_DIALOG.TEXT'));
          this.store.dispatch(ProductActions.setImportWarehouseImportProductResultState({ result: false }));
          this.resetAction();
        }
      });
  }

  ngOnDestroy() {
    this.store.dispatch(ProductActions.importWarehouseProductsCancelAction());
  }

  ngAfterViewInit() {
    this.successProductsImportsDatasource.paginator = this.successProductImportPaginator();
    this.failedProductsImportsDatasource.paginator = this.failedProductImportPaginator();
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
    try {
      this.store.dispatch(ProductActions.setUpdateWarehouseProductLoadingState({ state: true }));
      const item = this.filePicker().files;
      this.loader().label = this.translateService.instant('WAREHOUSE_PRODUCT_IMPORT_PAGE.IMPORT_PRODUCTS_SECTION.FIRST_STEP_SECTION.EXTRACT_PROCESS_TEXT');
      this.filePicker().adapter.uploadFile(item[0]).subscribe({
        next: (result: UploadResponse) => {
          this.store.dispatch(ProductActions.setUpdateWarehouseProductLoadingState({ state: false }));
          const data = result.body;
          this.successProductsImportsDatasource.data = data.successExtractedProducts;
          this.failedProductsImportsDatasource.data = data.failedExtractedProducts;
          this.stepper().next();
        },
        error: (e) => {
          this.store.dispatch(ProductActions.setUpdateWarehouseProductLoadingState({ state: false }));
          this.dialogService.openAlert(this.translateService.instant('WAREHOUSE_PRODUCT_IMPORT_PAGE.UPLOAD_FILE_VALIDATION_DIALOG.EXTRACT_FILE_ERROR_DIALOG.TITLE'), e.message);
          this.filePicker().removeFileFromList(item[0]);
        }
      });
    } catch (ex) {
      console.error(ex);
      this.loggerService.logMessage(LogLevelEnum.ERROR, ex);
    }
  }

  importProducts() {
    try {
      const products = this.successProductsImportsDatasource.data.map((extractedProduct: IMapExtractedProductPayload) => {
        const product = new Product();
        product.id = extractedProduct.id;
        product.name = extractedProduct.name;
        product.code = extractedProduct.code;
        product.supplierId = extractedProduct.supplierId;
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
    } catch (ex) {
      console.error(ex);
      this.loggerService.logMessage(LogLevelEnum.ERROR, ex);
    }
  }

  abortImport() {
    this.store.dispatch(ProductActions.importWarehouseProductsCancelAction());
    this.notificationService.openErrorNotification(this.translateService.instant('WAREHOUSE_PRODUCT_IMPORT_PAGE.ABORT_IMPORT_DIALOG.TEXT'));
  }

  resetImport() {
    this.dialogService
      .openConfirmation(
        this.translateService.instant('WAREHOUSE_PRODUCT_IMPORT_PAGE.RESET_IMPORT_DIALOG.TITLE'),
        this.translateService.instant('WAREHOUSE_PRODUCT_IMPORT_PAGE.RESET_IMPORT_DIALOG.CONFIRM'))
      .subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this.resetAction();
        }
      });
  }

  resetAction() {
    const item = this.filePicker().files;
    this.filePicker().removeFileFromList(item[0]);
    this.successProductsImportsDatasource.data = [];
    this.failedProductsImportsDatasource.data = [];
    this.stepper().reset();
  }

  get successProductImportColumns(): string[] {
    return ['status', 'code', 'name', 'supplierCode', 'quantity', 'unit', 'price', 'numberOfUnits'];
  }

  get failedProductImportColumns(): string[] {
    return ['rowNumber', 'message'];
  }
}
