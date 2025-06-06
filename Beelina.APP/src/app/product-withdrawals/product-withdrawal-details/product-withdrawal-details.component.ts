import { AfterViewInit, Component, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, pairwise, startWith, Subscription } from 'rxjs';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { SalesAgentTypeEnum } from 'src/app/_enum/sales-agent-type.enum';
import { StockAuditSourceEnum } from 'src/app/_enum/stock-audit-source.enum';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';
import { NumberFormatter } from 'src/app/_helpers/formatters/number-formatter.helper';

import { InsufficientProductQuantity } from 'src/app/_models/insufficient-product-quantity';
import { Product } from 'src/app/_models/product';
import { ProductStockAudit } from 'src/app/_models/product-stock-audit';
import { ProductWithdrawalEntry } from 'src/app/_models/product-withdrawal-entry';
import { ProductWithdrawalItemDetails } from 'src/app/_models/product-withdrawal-item-details.model';
import { PurchaseOrderItemDetails } from 'src/app/_models/purchase-order-item-details.model';
import { ProductWithdrawalEntryResult } from 'src/app/_models/results/product-withdrawal-entry-result';
import { User } from 'src/app/_models/user.model';

import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { ProductService } from 'src/app/_services/product.service';
import { SupplierService } from 'src/app/_services/supplier.service';

import { UniqueProductWithdrawalCodeValidator } from 'src/app/_validators/unique-product-withdrawal-code.validator';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { StockStatusEnum } from 'src/app/_enum/stock-status.enum';
import { PriceStatusEnum } from 'src/app/_enum/price-status.enum';

@Component({
  selector: 'app-product-withdrawal-details',
  templateUrl: './product-withdrawal-details.component.html',
  styleUrls: ['./product-withdrawal-details.component.scss']
})
export class ProductWithdrawalDetailsComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {

  private _productWithdrawalId: number = 0;
  private _productWithdrawalDetails: ProductWithdrawalEntryResult;
  private _panelProductsDatasource: Array<Product>;
  private _salesAgentDatasource: Array<User>;
  private _productItemId: number = 0;
  private _warehouseId: number = 1;
  private _subscription: Subscription = new Subscription();

  productWithdrawalDetailsForm: FormGroup;
  productWithdrawalItemsTableDatasource = new MatTableDataSource<ProductWithdrawalItemDetails>([]);

  activatedRoute = inject(ActivatedRoute);
  dialogService = inject(DialogService);
  notificationService = inject(NotificationService);
  formBuilder = inject(FormBuilder);
  productService = inject(ProductService);
  router = inject(Router);
  supplierService = inject(SupplierService);
  translateService = inject(TranslateService);
  uniqueProductWithdrawalCodeValidator = inject(UniqueProductWithdrawalCodeValidator);

  table = viewChild(MatTable<PurchaseOrderItemDetails>);
  paginator = viewChild(MatPaginator);

  constructor() {
    super();
    this.productWithdrawalDetailsForm = this.formBuilder.group({
      userAccountId: [null, Validators.required],
      stockEntryDate: [DateFormatter.format(new Date()), Validators.required],
      withdrawalSlipNo: ['',
        [Validators.required],
        [
          this.uniqueProductWithdrawalCodeValidator.validate.bind(
            this.uniqueProductWithdrawalCodeValidator
          ),
        ],
      ],
      notes: [''],
    });
  }

  ngAfterViewInit(): void {
    this._subscription.add(this.productWithdrawalDetailsForm
      .get('userAccountId')
      .valueChanges
      .pipe(startWith(0), pairwise())
      .subscribe(async ([prevValue, newValue]) => {
        if (this._productWithdrawalId === 0) {
          const resetItems = async () => {
            this._isLoading = true;
            this._panelProductsDatasource = await this.initPanelProductsDatasource(newValue);
            this.productWithdrawalItemsTableDatasource.data = [new ProductWithdrawalItemDetails()];
            this._isLoading = false;
          }

          if (this.productWithdrawalItemsTableDatasource.data.length > 0) {
            this.dialogService
              .openConfirmation(
                this.translateService.instant('PRODUCT_WITHDRAWAL_DETAILS_PAGE.RESET_PRODUCT_WITHDRAWAL_ITEMS_DIALOG.TITLE'),
                this.translateService.instant('PRODUCT_WITHDRAWAL_DETAILS_PAGE.RESET_PRODUCT_WITHDRAWAL_ITEMS_DIALOG.CONFIRM_MESSAGE')
              )
              .subscribe(async (result: ButtonOptions) => {
                if (result == ButtonOptions.YES) {
                  await resetItems();
                } else {
                  this.productWithdrawalDetailsForm.get('userAccountId').setValue(prevValue, { emitEvent: false });
                }
              });
          } else {
            await resetItems();
          }
        } else {
          this._isLoading = true;

          this._panelProductsDatasource = await this.initPanelProductsDatasource(+this._productWithdrawalDetails.userAccountId);
          this.productWithdrawalItemsTableDatasource.data = this._productWithdrawalDetails.productWithdrawalAuditsResult.map((poItem: ProductStockAudit) => {
            const purchaseOrderItem = new ProductWithdrawalItemDetails();
            purchaseOrderItem.id = poItem.id;
            purchaseOrderItem.productId = poItem.productId;
            purchaseOrderItem.quantity = poItem.quantity;

            const productDetails = this._panelProductsDatasource.find(p => p.id == poItem.productId);

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

    this.productWithdrawalItemsTableDatasource.paginator = this.paginator();
  }

  async ngOnInit() {
    this._productWithdrawalId = +this.activatedRoute.snapshot.paramMap.get('id');

    if (this._productWithdrawalId > 0) {
      this.productWithdrawalDetailsForm.get('userAccountId').disable();
    }

    this._salesAgentDatasource = await this.initSalesAgentDatasource();

    if (this._productWithdrawalId > 0) {
      this.uniqueProductWithdrawalCodeValidator.productWithdrawalId = this._productWithdrawalId;
      this._productWithdrawalDetails = await firstValueFrom(this.productService.getProductWithdrawalEntry(this._productWithdrawalId));

      this.productWithdrawalDetailsForm.get('userAccountId').setValue(+this._productWithdrawalDetails.userAccountId);
      this.productWithdrawalDetailsForm.get('stockEntryDate').setValue(DateFormatter.format(this._productWithdrawalDetails.stockEntryDate));
      this.productWithdrawalDetailsForm.get('withdrawalSlipNo').setValue(this._productWithdrawalDetails.withdrawalSlipNo);
      this.productWithdrawalDetailsForm.get('notes').setValue(this._productWithdrawalDetails.notes);
    }
  }

  onProductChange(productId: number, productWithdrawalDetails: ProductWithdrawalItemDetails, index: number) {
    const lastItemIndex = this.productWithdrawalItemsTableDatasource.data.length - 1;

    if (index === lastItemIndex) {
      this.addEntry();
    }

    const selectedProductDetails = this._panelProductsDatasource.find(p => p.id == productId);
    if (selectedProductDetails) {
      productWithdrawalDetails.code = selectedProductDetails.code;
      productWithdrawalDetails.unit = selectedProductDetails.productUnit.name;
      productWithdrawalDetails.unitPrice = selectedProductDetails.pricePerUnit;
      productWithdrawalDetails.amount = productWithdrawalDetails.quantity * productWithdrawalDetails.unitPrice;
    }
  }

  onQuantityChange(quantity: number, productWithdrawalDetails: ProductWithdrawalItemDetails) {
    this.productService
      .checkWarehouseProductStockQuantity(productWithdrawalDetails.productId, this._warehouseId, (quantity || 0))
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

          productWithdrawalDetails.quantity = 0;
          productWithdrawalDetails.amount = productWithdrawalDetails.quantity * productWithdrawalDetails.unitPrice;
          return;
        } else {
          productWithdrawalDetails.quantity = quantity;
          productWithdrawalDetails.amount = productWithdrawalDetails.quantity * productWithdrawalDetails.unitPrice;
        }
      });
  }

  onUnitPriceChange(unitPrice: number, productWithdrawalDetails: ProductWithdrawalItemDetails) {
    productWithdrawalDetails.unitPrice = unitPrice;
    productWithdrawalDetails.amount = productWithdrawalDetails.quantity * productWithdrawalDetails.unitPrice;
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  addEntry() {
    const newProductItem = new ProductWithdrawalItemDetails();
    newProductItem.id = this._productItemId;
    this._productItemId--;
    this.productWithdrawalItemsTableDatasource.data.push(newProductItem);
    this.productWithdrawalItemsTableDatasource.data = [...this.productWithdrawalItemsTableDatasource.data];
    this.paginator().lastPage();
  }

  removeEntry(productWithdrawalDetails: ProductWithdrawalItemDetails, rowIndex: number) {
    const lastItemIndex = this.productWithdrawalItemsTableDatasource.data.length - 1;
    if (rowIndex === lastItemIndex) return;

    const index = this.productWithdrawalItemsTableDatasource.data.findIndex((item: ProductWithdrawalItemDetails) => item.id == productWithdrawalDetails.id);
    this.productWithdrawalItemsTableDatasource.data.splice(index, 1);
    this.productWithdrawalItemsTableDatasource.data = [...this.productWithdrawalItemsTableDatasource.data];
  }

  save() {
    this.productWithdrawalDetailsForm.markAllAsTouched();

    if (this.productWithdrawalItemsTableDatasource.data.length == 0) {
      this.notificationService.openErrorNotification(this.translateService.instant('PRODUCT_WITHDRAWAL_DETAILS_PAGE.EMPTY_PRODUCT_WITHDRAWAL_ITEMS_NOTIFICATION.MESSAGE'));
      return;
    }

    if (this.productWithdrawalDetailsForm.valid) {
      let title = "";
      let message = "";
      let successMessage = "";
      let errorMessage = "";

      if (this._productWithdrawalId === 0) {
        title = this.translateService.instant('PRODUCT_WITHDRAWAL_DETAILS_PAGE.SAVE_NEW_PRODUCT_WITHDRAWAL_ITEMS_DIALOG.TITLE');
        message = this.translateService.instant('PRODUCT_WITHDRAWAL_DETAILS_PAGE.SAVE_NEW_PRODUCT_WITHDRAWAL_ITEMS_DIALOG.CONFIRM_MESSAGE');
        successMessage = this.translateService.instant('PRODUCT_WITHDRAWAL_DETAILS_PAGE.SAVE_NEW_PRODUCT_WITHDRAWAL_ITEMS_DIALOG.SUCCESS_MESSAGE');
        errorMessage = this.translateService.instant('PRODUCT_WITHDRAWAL_DETAILS_PAGE.SAVE_NEW_PRODUCT_WITHDRAWAL_ITEMS_DIALOG.ERROR_MESSAGE');
      } else {
        title = this.translateService.instant('PRODUCT_WITHDRAWAL_DETAILS_PAGE.UPDATE_PRODUCT_WITHDRAWAL_ITEMS_DIALOG.TITLE');
        message = this.translateService.instant('PRODUCT_WITHDRAWAL_DETAILS_PAGE.UPDATE_PRODUCT_WITHDRAWAL_ITEMS_DIALOG.CONFIRM_MESSAGE');
        successMessage = this.translateService.instant('PRODUCT_WITHDRAWAL_DETAILS_PAGE.UPDATE_PRODUCT_WITHDRAWAL_ITEMS_DIALOG.SUCCESS_MESSAGE');
        errorMessage = this.translateService.instant('PRODUCT_WITHDRAWAL_DETAILS_PAGE.UPDATE_PRODUCT_WITHDRAWAL_ITEMS_DIALOG.ERROR_MESSAGE');
      }

      this.dialogService.openConfirmation(title, message).subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {

          const userAccountIdControl = this.productWithdrawalDetailsForm.get('userAccountId');
          const stockEntryDateControl = this.productWithdrawalDetailsForm.get('stockEntryDate');
          const withdrawalSlipNoControl = this.productWithdrawalDetailsForm.get('withdrawalSlipNo');
          const notesControl = this.productWithdrawalDetailsForm.get('notes');

          const productWithdrawal = new ProductWithdrawalEntry();
          const warehouseId = 1;

          productWithdrawal.id = this._productWithdrawalId;
          productWithdrawal.userAccountId = userAccountIdControl.value;
          productWithdrawal.stockEntryDate = stockEntryDateControl.value;
          productWithdrawal.withdrawalSlipNo = withdrawalSlipNoControl.value;
          productWithdrawal.notes = notesControl.value;

          productWithdrawal.productStockAudits = this.productWithdrawalItemsTableDatasource.data.filter(p => p.productId > 0).map(x => {
            const productStockAudit = new ProductStockAudit();

            productStockAudit.id = x.id;
            productStockAudit.productId = x.productId;
            productStockAudit.quantity = x.quantity;
            productStockAudit.pricePerUnit = x.unitPrice;
            productStockAudit.warehouseId = warehouseId;
            productStockAudit.stockAuditSource = StockAuditSourceEnum.FromWithdrawal;

            return productStockAudit;
          });

          this.productService
            .updateProductWithdrawalEntries([productWithdrawal])
            .subscribe({
              next: () => {
                this.notificationService.openSuccessNotification(successMessage);

                if (this._productWithdrawalId > 0) {
                  window.location.reload();
                } else {
                  this.router.navigate([`product-withdrawals`]);
                }
              },
              error: () => {
                this.notificationService.openErrorNotification(errorMessage);
              }
            });
        }
      });
    } else {
      this.notificationService.openErrorNotification(this.translateService.instant('PRODUCT_WITHDRAWAL_DETAILS_PAGE.INVALID_PRODUCT_WITHDRAWAL_NOTIFICATION.MESSAGE'));
    }
  }

  removeProductWithdrawal() {
    this.dialogService
      .openConfirmation(
        this.translateService.instant("PRODUCT_WITHDRAWAL_DETAILS_PAGE.DELETE_PRODUCT_WITHDRAWAL_ITEMS_DIALOG.TITLE"),
        this.translateService.instant("PRODUCT_WITHDRAWAL_DETAILS_PAGE.DELETE_PRODUCT_WITHDRAWAL_ITEMS_DIALOG.CONFIRM_MESSAGE")
      )
      .subscribe((result: ButtonOptions) => {
        if (result == ButtonOptions.YES) {
          this.productService
            .deleteProductWithdrawalEntry(this._productWithdrawalId)
            .subscribe({
              next: () => {
                this.notificationService.openSuccessNotification(this.translateService.instant("PRODUCT_WITHDRAWAL_DETAILS_PAGE.DELETE_PRODUCT_WITHDRAWAL_ITEMS_DIALOG.SUCCESS_MESSAGE"));
                this.router.navigate([`product-withdrawals`]);
              },
              error: () => {
                this.notificationService.openSuccessNotification(this.translateService.instant("PRODUCT_WITHDRAWAL_DETAILS_PAGE.DELETE_PRODUCT_WITHDRAWAL_ITEMS_DIALOG.ERROR_MESSAGE"));
              }
            })
        }
      });
  }

  private async initPanelProductsDatasource(userAccountId: number) {
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
      result = await firstValueFrom(this.productService.getProducts(userAccountId, result.endCursor, "", 0, StockStatusEnum.All, PriceStatusEnum.All, 1000, []));
      allProducts.push(...result.products);
    } while (result.hasNextPage);

    return allProducts;
  }

  private async initSalesAgentDatasource() {
    const allSalesAgents = await firstValueFrom(this.productService.getSalesAgentsList());
    const fieldSalesAgents = allSalesAgents.filter(s => s.salesAgentType === SalesAgentTypeEnum.FieldAgent); // Only field sales agents
    return fieldSalesAgents;
  }

  get panelProductsDatasource() {
    return this._panelProductsDatasource;
  }

  get salesAgentDatasource() {
    return this._salesAgentDatasource;
  }

  get newProductWithdrawal() {
    return this._productWithdrawalId === 0;
  }

  get totalQuantity() {
    return this.productWithdrawalItemsTableDatasource.data.map(t => t.quantity).reduce((acc, value) => acc + value, 0);
  }

  get totalAmount() {
    const amount = this.productWithdrawalItemsTableDatasource.data.map(t => t.amount).reduce((acc, value) => acc + value, 0);
    return NumberFormatter.formatCurrency(amount);
  }

  displayedColumns: string[] = ['product', 'unit', 'code', 'quantity', 'unitPrice', 'amount', 'actions'];

}
