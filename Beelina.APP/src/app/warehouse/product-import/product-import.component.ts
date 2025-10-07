import { Component, OnDestroy, OnInit, inject, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
import { Store, select } from '@ngrx/store';
import { firstValueFrom, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FilePickerComponent, UploadResponse, ValidationError } from 'ngx-awesome-uploader';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { IFailedExtractedProductPayload } from 'src/app/_interfaces/payloads/ifailed-product-import.payload';
import { IMapExtractedProductPayload } from 'src/app/_interfaces/payloads/imap-product-import.payload';
import { Product } from 'src/app/_models/product';

import * as ProductActions from '../store/actions';
import { importedProductsSelector, importResultSelector, isImportLoadingSelector, isLoadingSelector } from '../store/selectors';

import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { LoaderLayoutComponent } from 'src/app/shared/ui/loader-layout/loader-layout.component';
import { LogMessageService } from 'src/app/_services/log-message.service';

import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { ProductService } from 'src/app/_services/product.service';

import { WarehouseFilePickerAdapter } from '../warehouse-file-picker.adapter';
import { LogLevelEnum } from 'src/app/_enum/log-type.enum';
import { ProductWarehouseStockReceiptEntry } from 'src/app/_models/product-warehouse-stock-receipt-entry';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';
import { ProductStockWarehouseAudit } from 'src/app/_models/product-stock-warehouse-audit';
import { StockAuditSourceEnum } from 'src/app/_enum/stock-audit-source.enum';

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

  extractedProducts: Array<Product> = [];

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

    this.store.pipe(select(importedProductsSelector))
      .subscribe((importedProducts: Array<Product>) => {
        if (importedProducts.length > 0) {

          // Auto-register purchase order for each supplier
          const suppliers = [...new Set(importedProducts.map((product: Product) => product.supplierId))];
          const purchaseOrders: Array<ProductWarehouseStockReceiptEntry> = [];

          suppliers.forEach((supplierId: number) => {
            const supplierProducts = importedProducts.filter((product: Product) => product.supplierId === supplierId);

            const purchaseOrder = new ProductWarehouseStockReceiptEntry();
            purchaseOrder.id = 0;
            purchaseOrder.supplierId = supplierId;
            purchaseOrder.stockEntryDate = new Date();
            purchaseOrder.referenceNo = `PO-${DateFormatter.format(new Date(), 'YYYYMMDDHHmmss')}-${Math.random().toString(36).slice(2)}`;
            purchaseOrder.plateNo = "";
            purchaseOrder.notes = this.translateService.instant("WAREHOUSE_PRODUCT_IMPORT_PAGE.AUTO_REGISTER_PURCHASE_ORDER.DEFAULT_NOTES");

            supplierProducts.forEach((product: Product) => {
              const extractedProductDetails = this.extractedProducts.find((extractedProduct: Product) => extractedProduct.code === product.code);
              const importedProductDetails = importedProducts.find((importedProduct: Product) => importedProduct.code === product.code);

              // Only add to stock receipt entry if the imported product has stock quantity > 0
              // This is to avoid creating stock receipt entries with 0 quantity which may cause confusion
              if (extractedProductDetails && extractedProductDetails.stockQuantity !== 0) {
                const productStockWarehouseAudit = new ProductStockWarehouseAudit();
                productStockWarehouseAudit.id = 0;
                productStockWarehouseAudit.productId = importedProductDetails.id;
                productStockWarehouseAudit.quantity = extractedProductDetails.stockQuantity;
                productStockWarehouseAudit.pricePerUnit = extractedProductDetails.pricePerUnit;
                productStockWarehouseAudit.stockAuditSource = StockAuditSourceEnum.OrderFromSupplier;

                purchaseOrder.productStockWarehouseAuditInputs.push(productStockWarehouseAudit);
              }
            });

            if (purchaseOrder.productStockWarehouseAuditInputs.length > 0) {
              purchaseOrders.push(purchaseOrder);
            }
          });
          if (purchaseOrders.length > 0) {
            firstValueFrom(this.productService.updateWarehouseStockReceiptEntries(purchaseOrders));
          }
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
      this.extractedProducts = this.successProductsImportsDatasource.data.map((extractedProduct: IMapExtractedProductPayload) => {
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
        product.costPrice = extractedProduct.price || extractedProduct.originalPrice;
        product.productUnit.name = extractedProduct.unit || extractedProduct.originalUnit;
        product.validFrom = extractedProduct.validFrom;
        product.validTo = extractedProduct.validTo;
        product.parent = extractedProduct.parent;
        product.productParentGroupId = extractedProduct.productParentGroupId;
        return product;
      });

      if (this.extractedProducts.length === 0) return;

      this.store.dispatch(ProductActions.importWarehouseProductsAction({ products: this.extractedProducts }));
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
