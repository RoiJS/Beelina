import { AfterViewInit, Component, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, pairwise, startWith, Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';

import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { PurchaseOrderStatusEnum } from 'src/app/_enum/purchase-order-status.enum';
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
import { StockStatusEnum } from 'src/app/_enum/stock-status.enum';
import { PriceStatusEnum } from 'src/app/_enum/price-status.enum';
import { ProductsFilter } from 'src/app/_models/filters/products.filter';
import { ProductActiveStatusEnum } from 'src/app/_enum/product-active-status.enum';

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
  private _latestPurchaseOrderReferenceCode: string;

  private _subscription: Subscription = new Subscription();

  purchaseOrderDetailsForm: FormGroup;
  purchaseOrderItemsTableDatasource = new MatTableDataSource<PurchaseOrderItemDetails>([]);

  // Enum for template usage
  purchaseOrderStatusEnum = PurchaseOrderStatusEnum;

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
      // New fields for purchase order report
      discount: [0],
      invoiceNo: [''],
      invoiceDate: [''],
      dateEncoded: [DateFormatter.format(new Date())],
      purchaseOrderStatus: [PurchaseOrderStatusEnum.OPEN],
      location: [''],
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
              purchaseOrderItem.unitPrice = NumberFormatter.roundToDecimalPlaces(productDetails.pricePerUnit, 2);
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

    if (this._purchaseOrderId === 0) {
      // Only fetch and prefill for new purchase order
      this._latestPurchaseOrderReferenceCode = await firstValueFrom(this.productService.getLatestPurchaseOrderReferenceCode());
      const nextReferenceCode = this.incrementCode(this._latestPurchaseOrderReferenceCode);
      this.purchaseOrderDetailsForm.get('referenceNo').setValue(nextReferenceCode);
    }

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
      // Set new fields
      this.purchaseOrderDetailsForm.get('discount').setValue(this._purchaseOrderDetails.discount || 0);
      this.purchaseOrderDetailsForm.get('invoiceNo').setValue(this._purchaseOrderDetails.invoiceNo || '');
      this.purchaseOrderDetailsForm.get('invoiceDate').setValue(this._purchaseOrderDetails.invoiceDate ? DateFormatter.format(this._purchaseOrderDetails.invoiceDate) : '');
      this.purchaseOrderDetailsForm.get('dateEncoded').setValue(this._purchaseOrderDetails.dateEncoded ? DateFormatter.format(this._purchaseOrderDetails.dateEncoded) : DateFormatter.format(new Date()));
      this.purchaseOrderDetailsForm.get('purchaseOrderStatus').setValue(this._purchaseOrderDetails.purchaseOrderStatus || PurchaseOrderStatusEnum.OPEN);
      this.purchaseOrderDetailsForm.get('location').setValue(this._purchaseOrderDetails.location || '');
    }
  }

  onProductChange(productId: number, purchaseOrderDetails: PurchaseOrderItemDetails, index: number) {
    const selectedProductDetails = this._warehouseProductsDatasource.find(p => p.id == productId);
    const lastItemIndex = this.purchaseOrderItemsTableDatasource.data.length - 1;

    if (index === lastItemIndex) {
      this.addEntry();
    }

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

  removeEntry(purchaseOrderDetails: PurchaseOrderItemDetails, rowIndex: number) {
    const lastItemIndex = this.purchaseOrderItemsTableDatasource.data.length - 1;
    if (rowIndex === lastItemIndex) return;

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
          const discountControl = this.purchaseOrderDetailsForm.get('discount');
          const invoiceNoControl = this.purchaseOrderDetailsForm.get('invoiceNo');
          const invoiceDateControl = this.purchaseOrderDetailsForm.get('invoiceDate');
          const dateEncodedControl = this.purchaseOrderDetailsForm.get('dateEncoded');
          const purchaseOrderStatusControl = this.purchaseOrderDetailsForm.get('purchaseOrderStatus');
          const locationControl = this.purchaseOrderDetailsForm.get('location');

          const purchaseOrder = new ProductWarehouseStockReceiptEntry();

          purchaseOrder.id = this._purchaseOrderId;
          purchaseOrder.supplierId = supplierIdControl.value;
          purchaseOrder.stockEntryDate = stockEntryDateControl.value;
          purchaseOrder.referenceNo = referenceNoControl.value;
          purchaseOrder.plateNo = plateNoControl.value;
          purchaseOrder.notes = notesControl.value;
          purchaseOrder.discount = discountControl.value;
          purchaseOrder.invoiceNo = invoiceNoControl.value;
          purchaseOrder.invoiceDate = invoiceDateControl.value;
          purchaseOrder.dateEncoded = dateEncodedControl.value;
          purchaseOrder.purchaseOrderStatus = purchaseOrderStatusControl.value;
          purchaseOrder.location = locationControl.value;

          purchaseOrder.productStockWarehouseAuditInputs = this.purchaseOrderItemsTableDatasource.data.filter(p => p.productId > 0).map(x => {
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

    const productsFilter = new ProductsFilter();
    productsFilter.supplierId = supplierId;
    productsFilter.stockStatus = StockStatusEnum.All;
    productsFilter.priceStatus = PriceStatusEnum.All;
    productsFilter.activeStatus = ProductActiveStatusEnum.IncludeInactive;

    do {
      result = await firstValueFrom(this.productService.getWarehouseProducts(result.endCursor, productsFilter, "", 1000));
      allProducts.push(...result.products);
    } while (result.hasNextPage);

    return allProducts;
  }

  private async initSupplierDatasource() {
    return await firstValueFrom(this.supplierService.getAllSuppliers());
  }

  isProductActive(row: PurchaseOrderItemDetails): boolean {
    if (!row.productId || !this._warehouseProductsDatasource) {
      return true; // Default to active if no product selected or data not loaded
    }

    const product = this._warehouseProductsDatasource.find(p => p.id === row.productId);
    return product ? product.isCurrentlyActive : true;
  }

  private calculateGrossTotal() {
    return this.purchaseOrderItemsTableDatasource.data.map(t => t.amount).reduce((acc, value) => acc + value, 0);
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
    const amount = this.calculateGrossTotal();
    return NumberFormatter.formatCurrency(amount);
  }

  get grossTotal() {
    const amount = this.calculateGrossTotal();
    return NumberFormatter.formatCurrency(amount);
  }

  get discountPercentage() {
    return this.purchaseOrderDetailsForm.get('discount')?.value || 0;
  }

  get discountAmount() {
    const gross = this.calculateGrossTotal();
    const discountPercent = this.discountPercentage;
    const discount = (gross * discountPercent) / 100;
    return NumberFormatter.formatCurrency(discount);
  }

  get netTotal() {
    const gross = this.calculateGrossTotal();
    const discountPercent = this.discountPercentage;
    const discount = (gross * discountPercent) / 100;
    const net = gross - discount;
    return NumberFormatter.formatCurrency(net);
  }

  displayedColumns: string[] = ['product', 'unit', 'code', 'quantity', 'unitPrice', 'amount', 'actions'];
}
