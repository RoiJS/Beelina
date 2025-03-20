import { AfterViewInit, Component, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, pairwise, startWith, Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';

import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { StockAuditSourceEnum } from 'src/app/_enum/stock-audit-source.enum';
import { Product } from 'src/app/_models/product';
import { ProductStockWarehouseAudit } from 'src/app/_models/product-stock-warehouse-audit';
import { ProductWarehouseStockReceiptEntry } from 'src/app/_models/product-warehouse-stock-receipt-entry';
import { PurchaseOrderItemDetails } from 'src/app/_models/purchase-order-item-details.model';
import { ProductWarehouseStockReceiptEntryResult } from 'src/app/_models/results/product-warehouse-stock-receipt-entry-result';
import { Supplier } from 'src/app/_models/supplier';

import { ProductService } from 'src/app/_services/product.service';
import { SupplierService } from 'src/app/_services/supplier.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';

import { NumberFormatter } from 'src/app/_helpers/formatters/number-formatter.helper';
import { UniquePurchaseOrderCodeValidator } from 'src/app/_validators/unique-purchase-order-code.validator';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

@Component({
  selector: 'app-purchase-order-details',
  templateUrl: './purchase-order-details.component.html',
  styleUrls: ['./purchase-order-details.component.scss']
})
export class PurchaseOrderDetailsComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {

  private _purchaseOrderId: number = 0;
  private _purchaseOrderDetails: ProductWarehouseStockReceiptEntryResult;
  private _warehouseProductsDatasource: Array<Product>;
  private _supplierDatasource: Array<Supplier>;
  private _productItemId: number = 0;

  private _subscription: Subscription = new Subscription();

  purchaseOrderDetailsForm: FormGroup;
  purchaseOrderItemsTableDatasource = new MatTableDataSource<PurchaseOrderItemDetails>([]);

  activatedRoute = inject(ActivatedRoute);
  dialogService = inject(DialogService);
  notificationService = inject(NotificationService);
  formBuilder = inject(FormBuilder);
  productService = inject(ProductService);
  router = inject(Router);
  supplierService = inject(SupplierService);
  translateService = inject(TranslateService);
  uniquePurchaseOrderCodeValidator = inject(UniquePurchaseOrderCodeValidator);

  table = viewChild(MatTable<PurchaseOrderItemDetails>);
  paginator = viewChild(MatPaginator);

  constructor() {
    super();
    this.purchaseOrderDetailsForm = this.formBuilder.group({
      supplierId: [null, Validators.required],
      stockEntryDate: [DateFormatter.format(new Date()), Validators.required],
      referenceNo: ['',
        [Validators.required],
        [
          this.uniquePurchaseOrderCodeValidator.validate.bind(
            this.uniquePurchaseOrderCodeValidator
          ),
        ],
      ],
      plateNo: [''],
      notes: [''],
    });
  }

  ngAfterViewInit(): void {
    this._subscription.add(this.purchaseOrderDetailsForm
      .get('supplierId')
      .valueChanges
      .pipe(startWith(0), pairwise())
      .subscribe(async ([prevValue, newValue]) => {
        if (this._purchaseOrderId === 0) {
          const resetItems = async () => {
            this._isLoading = true;
            this._warehouseProductsDatasource = await this.initWarehouseProductsDatasource(newValue);
            this.purchaseOrderItemsTableDatasource.data = [new PurchaseOrderItemDetails()];
            this._isLoading = false;
          }

          if (this.purchaseOrderItemsTableDatasource.data.length > 0) {
            this.dialogService
              .openConfirmation(
                this.translateService.instant('PURCHASE_ORDER_DETAILS_PAGE.RESET_PURCHASE_ORDER_ITEMS_DIALOG.TITLE'),
                this.translateService.instant('PURCHASE_ORDER_DETAILS_PAGE.RESET_PURCHASE_ORDER_ITEMS_DIALOG.CONFIRM_MESSAGE')
              )
              .subscribe(async (result: ButtonOptions) => {
                if (result == ButtonOptions.YES) {
                  await resetItems();
                } else {
                  this.purchaseOrderDetailsForm.get('supplierId').setValue(prevValue, { emitEvent: false });
                }
              });
          } else {
            await resetItems();
          }
        } else {
          this._isLoading = true;

          this._warehouseProductsDatasource = await this.initWarehouseProductsDatasource(+this._purchaseOrderDetails.supplierId);
          this.purchaseOrderItemsTableDatasource.data = this._purchaseOrderDetails.productStockWarehouseAuditsResult.map((poItem: ProductStockWarehouseAudit) => {
            const purchaseOrderItem = new PurchaseOrderItemDetails();
            purchaseOrderItem.id = poItem.id;
            purchaseOrderItem.productId = poItem.productId;
            purchaseOrderItem.productStockPerWarehouseId = poItem.productStockPerWarehouseId;
            purchaseOrderItem.quantity = poItem.quantity;

            const productDetails = this._warehouseProductsDatasource.find(p => p.id == poItem.productId);

            if (productDetails) {
              purchaseOrderItem.name = productDetails.name;
              purchaseOrderItem.code = productDetails.code;
              purchaseOrderItem.unit = productDetails.productUnit.name;
              purchaseOrderItem.unitPrice = productDetails.pricePerUnit;
            }

            purchaseOrderItem.amount = poItem.quantity * purchaseOrderItem.unitPrice;

            return purchaseOrderItem;
          });

          this._isLoading = false;
        }
      }));

    this.purchaseOrderItemsTableDatasource.paginator = this.paginator();
  }

  async ngOnInit() {
    this._purchaseOrderId = +this.activatedRoute.snapshot.paramMap.get('id');

    if (this._purchaseOrderId > 0) {
      this.purchaseOrderDetailsForm.get('supplierId').disable();
    }

    this._supplierDatasource = await this.initSupplierDatasource();

    if (this._purchaseOrderId > 0) {
      this.uniquePurchaseOrderCodeValidator.purchaseOrderId = this._purchaseOrderId;
      this._purchaseOrderDetails = await firstValueFrom(this.productService.getProductWarehouseStockReceiptEntry(this._purchaseOrderId));

      this.purchaseOrderDetailsForm.get('supplierId').setValue(+this._purchaseOrderDetails.supplierId);
      this.purchaseOrderDetailsForm.get('stockEntryDate').setValue(DateFormatter.format(this._purchaseOrderDetails.stockEntryDate));
      this.purchaseOrderDetailsForm.get('referenceNo').setValue(this._purchaseOrderDetails.referenceNo);
      this.purchaseOrderDetailsForm.get('plateNo').setValue(this._purchaseOrderDetails.plateNo);
      this.purchaseOrderDetailsForm.get('notes').setValue(this._purchaseOrderDetails.notes);
    }
  }

  onProductChange(productId: number, purchaseOrderDetails: PurchaseOrderItemDetails) {
    const selectedProductDetails = this._warehouseProductsDatasource.find(p => p.id == productId);
    if (selectedProductDetails) {
      purchaseOrderDetails.code = selectedProductDetails.code;
      purchaseOrderDetails.unit = selectedProductDetails.productUnit.name;
      purchaseOrderDetails.unitPrice = selectedProductDetails.pricePerUnit;
      purchaseOrderDetails.amount = purchaseOrderDetails.quantity * purchaseOrderDetails.unitPrice;
    }
  }

  onQuantityChange(quantity: number, purchaseOrderDetails: PurchaseOrderItemDetails) {
    purchaseOrderDetails.quantity = quantity;
    purchaseOrderDetails.amount = purchaseOrderDetails.quantity * purchaseOrderDetails.unitPrice;
  }

  onUnitPriceChange(unitPrice: number, purchaseOrderDetails: PurchaseOrderItemDetails) {
    purchaseOrderDetails.unitPrice = unitPrice;
    purchaseOrderDetails.amount = purchaseOrderDetails.quantity * purchaseOrderDetails.unitPrice;
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  addEntry() {
    const newProductItem = new PurchaseOrderItemDetails();
    newProductItem.id = this._productItemId;
    this._productItemId--;
    this.purchaseOrderItemsTableDatasource.data.push(newProductItem);
    this.purchaseOrderItemsTableDatasource.data = [...this.purchaseOrderItemsTableDatasource.data];
    this.paginator().lastPage();
  }

  removeEntry(purchaseOrderDetails: PurchaseOrderItemDetails) {
    const index = this.purchaseOrderItemsTableDatasource.data.findIndex((item: PurchaseOrderItemDetails) => item.id == purchaseOrderDetails.id);
    this.purchaseOrderItemsTableDatasource.data.splice(index, 1);
    this.purchaseOrderItemsTableDatasource.data = [...this.purchaseOrderItemsTableDatasource.data];
  }

  save() {
    this.purchaseOrderDetailsForm.markAllAsTouched();

    if (this.purchaseOrderItemsTableDatasource.data.length == 0) {
      this.notificationService.openErrorNotification(this.translateService.instant('PURCHASE_ORDER_DETAILS_PAGE.EMPTY_PURCHASE_ORDER_ITEMS_NOTIFICATION.MESSAGE'));
      return;
    }

    if (this.purchaseOrderDetailsForm.valid) {
      let title = "";
      let message = "";
      let successMessage = "";
      let errorMessage = "";

      if (this._purchaseOrderId === 0) {
        title = this.translateService.instant('PURCHASE_ORDER_DETAILS_PAGE.SAVE_NEW_PURCHASE_ORDER_ITEMS_DIALOG.TITLE');
        message = this.translateService.instant('PURCHASE_ORDER_DETAILS_PAGE.SAVE_NEW_PURCHASE_ORDER_ITEMS_DIALOG.CONFIRM_MESSAGE');
        successMessage = this.translateService.instant('PURCHASE_ORDER_DETAILS_PAGE.SAVE_NEW_PURCHASE_ORDER_ITEMS_DIALOG.SUCCESS_MESSAGE');
        errorMessage = this.translateService.instant('PURCHASE_ORDER_DETAILS_PAGE.SAVE_NEW_PURCHASE_ORDER_ITEMS_DIALOG.ERROR_MESSAGE');
      } else {
        title = this.translateService.instant('PURCHASE_ORDER_DETAILS_PAGE.UPDATE_PURCHASE_ORDER_ITEMS_DIALOG.TITLE');
        message = this.translateService.instant('PURCHASE_ORDER_DETAILS_PAGE.UPDATE_PURCHASE_ORDER_ITEMS_DIALOG.CONFIRM_MESSAGE');
        successMessage = this.translateService.instant('PURCHASE_ORDER_DETAILS_PAGE.UPDATE_PURCHASE_ORDER_ITEMS_DIALOG.SUCCESS_MESSAGE');
        errorMessage = this.translateService.instant('PURCHASE_ORDER_DETAILS_PAGE.UPDATE_PURCHASE_ORDER_ITEMS_DIALOG.ERROR_MESSAGE');
      }

      this.dialogService.openConfirmation(title, message).subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {

          const supplierIdControl = this.purchaseOrderDetailsForm.get('supplierId');
          const stockEntryDateControl = this.purchaseOrderDetailsForm.get('stockEntryDate');
          const referenceNoControl = this.purchaseOrderDetailsForm.get('referenceNo');
          const plateNoControl = this.purchaseOrderDetailsForm.get('plateNo');
          const notesControl = this.purchaseOrderDetailsForm.get('notes');

          const purchaseOrder = new ProductWarehouseStockReceiptEntry();

          purchaseOrder.id = this._purchaseOrderId;
          purchaseOrder.supplierId = supplierIdControl.value;
          purchaseOrder.stockEntryDate = stockEntryDateControl.value;
          purchaseOrder.referenceNo = referenceNoControl.value;
          purchaseOrder.plateNo = plateNoControl.value;
          purchaseOrder.notes = notesControl.value;

          purchaseOrder.productStockWarehouseAudits = this.purchaseOrderItemsTableDatasource.data.filter(p => p.productId > 0).map(x => {
            const productStockWarehouseAudit = new ProductStockWarehouseAudit();

            productStockWarehouseAudit.id = x.id;
            productStockWarehouseAudit.productId = x.productId;
            productStockWarehouseAudit.quantity = x.quantity;
            productStockWarehouseAudit.pricePerUnit = x.unitPrice;
            productStockWarehouseAudit.stockAuditSource = StockAuditSourceEnum.OrderFromSupplier;

            return productStockWarehouseAudit;
          });

          this.productService
            .updateWarehouseStockReceiptEntries([purchaseOrder])
            .subscribe({
              next: () => {
                this.notificationService.openSuccessNotification(successMessage);

                if (this._purchaseOrderId > 0) {
                  window.location.reload();
                } else {
                  this.router.navigate([`purchase-orders`]);
                }
              },
              error: () => {
                this.notificationService.openErrorNotification(errorMessage);
              }
            });
        }
      });
    } else {
      this.notificationService.openErrorNotification(this.translateService.instant('PURCHASE_ORDER_DETAILS_PAGE.INVALID_PURCHASE_ORDER_NOTIFICATION.MESSAGE'));
    }
  }

  removePurchaseOrder() {
    this.dialogService
      .openConfirmation(
        this.translateService.instant("PURCHASE_ORDER_DETAILS_PAGE.DELETE_PURCHASE_ORDER_ITEMS_DIALOG.TITLE"),
        this.translateService.instant("PURCHASE_ORDER_DETAILS_PAGE.DELETE_PURCHASE_ORDER_ITEMS_DIALOG.CONFIRM_MESSAGE")
      )
      .subscribe((result: ButtonOptions) => {
        if (result == ButtonOptions.YES) {
          this.productService
            .deleteWarehouseStockReceiptEntry(this._purchaseOrderId)
            .subscribe({
              next: () => {
                this.notificationService.openSuccessNotification(this.translateService.instant("PURCHASE_ORDER_DETAILS_PAGE.DELETE_PURCHASE_ORDER_ITEMS_DIALOG.SUCCESS_MESSAGE"));
                this.router.navigate([`purchase-orders`]);
              },
              error: () => {
                this.notificationService.openSuccessNotification(this.translateService.instant("PURCHASE_ORDER_DETAILS_PAGE.DELETE_PURCHASE_ORDER_ITEMS_DIALOG.ERROR_MESSAGE"));
              }
            })
        }
      });
  }

  private async initWarehouseProductsDatasource(supplierId: number) {
    const allProducts: Array<Product> = [];
    let result: {
      endCursor: string;
      hasNextPage: boolean;
      products: Array<Product>;
      totalCount: number;
    } = {
      endCursor: null,
      hasNextPage: false,
      products: [],
      totalCount: 0
    };

    do {
      result = await firstValueFrom(this.productService.getWarehouseProducts(result.endCursor, supplierId, "", 1000));
      allProducts.push(...result.products);
    } while (result.hasNextPage);

    return allProducts;
  }

  private async initSupplierDatasource() {
    return await firstValueFrom(this.supplierService.getAllSuppliers());
  }

  get warehouseProductsDatasource() {
    return this._warehouseProductsDatasource;
  }

  get suppliersDatasource() {
    return this._supplierDatasource;
  }

  get newPurchaseOrder() {
    return this._purchaseOrderId === 0;
  }

  get totalQuantity() {
    return this.purchaseOrderItemsTableDatasource.data.map(t => t.quantity).reduce((acc, value) => acc + value, 0);
  }

  get totalAmount() {
    const amount = this.purchaseOrderItemsTableDatasource.data.map(t => t.amount).reduce((acc, value) => acc + value, 0);
    return NumberFormatter.formatCurrency(amount);
  }

  displayedColumns: string[] = ['product', 'unit', 'code', 'quantity', 'unitPrice', 'amount', 'actions'];
}
