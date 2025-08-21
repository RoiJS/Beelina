import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription, map, startWith, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { ProductService } from 'src/app/_services/product.service';
import { BaseControlComponent } from '../base-control/base-control.component';
import { ProductWarehouseStockReceiptEntry } from 'src/app/_models/product-warehouse-stock-receipt-entry';
import { SortOrderOptionsEnum } from 'src/app/_enum/sort-order-options.enum';

@Component({
  selector: 'app-purchase-order-reference-no-autocomplete-control',
  templateUrl: './purchase-order-reference-no-autocomplete-control.component.html',
  styleUrls: ['./purchase-order-reference-no-autocomplete-control.component.scss']
})
export class PurchaseOrderReferenceNoAutocompleteControlComponent extends BaseControlComponent implements OnInit, OnDestroy {

  private _productService: ProductService;
  private _subscription: Subscription = new Subscription();

  purchaseOrderReferenceNoControl = new FormControl();
  filteredPurchaseOrderReferenceNos: Observable<Array<ProductWarehouseStockReceiptEntry>>;
  selectedPurchaseOrder: ProductWarehouseStockReceiptEntry;

  constructor(
    productService: ProductService,
    protected override translateService: TranslateService
  ) {
    super(translateService);
    this._productService = productService;
  }

  override ngOnInit() {
    this.filteredPurchaseOrderReferenceNos = this.purchaseOrderReferenceNoControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value: string | ProductWarehouseStockReceiptEntry) => {
        if (typeof value === 'string') {
          return this._filterPurchaseOrderReferenceNos(value);
        } else {
          return of([]);
        }
      })
    );

    this._subscription.add(
      this.purchaseOrderReferenceNoControl.valueChanges.subscribe((value: string | ProductWarehouseStockReceiptEntry) => {
        if (typeof value === 'object' && value !== null) {
          this.selectedPurchaseOrder = value;
          this._notifyValueChange(value.id);
        } else if (typeof value === 'string') {
          this.selectedPurchaseOrder = null;
          this._notifyValueChange(null);
        }
      })
    );

    // Set initial value if provided
    const initialValue = this.value();
    if (initialValue && typeof initialValue === 'number') {
      this._loadInitialPurchaseOrder(initialValue);
    }
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  override value(value: any = null): any {
    if (value !== null && value !== undefined) {
      // Setting value
      this._loadInitialPurchaseOrder(value);
      return value;
    } else {
      // Getting value
      return this.selectedPurchaseOrder ? this.selectedPurchaseOrder.referenceNo : null;
    }
  }

  private _notifyValueChange(value: any): void {
    // This will be used to notify parent components of value changes
    // When a purchase order is selected, auto-fill related controls
    if (this.selectedPurchaseOrder) {
      // Auto-fill supplier if available
      if (this.selectedPurchaseOrder.supplierId) {
        this._updateSupplierControl(this.selectedPurchaseOrder.supplierId);
      }

      // Auto-fill date range if available
      if (this.selectedPurchaseOrder.stockEntryDate) {
        this._updateDatePickerControls(this.selectedPurchaseOrder.stockEntryDate);
      }

      // Disable related controls when PO is selected
      this._disableRelatedControls();
    } else {
      // Enable related controls when PO is cleared
      this._enableRelatedControls();
    }
  }
  private _filterPurchaseOrderReferenceNos(value: string): Observable<Array<ProductWarehouseStockReceiptEntry>> {
    if (!value || value.length < 2) {
      return of([]);
    }

    return this._productService.getProductWarehouseStockReceiptEntries(
      value,
      0, // supplierId
      '', // dateFrom
      '', // dateTo
      0, // skip
      10, // take
      'referenceNo', // sortField
      SortOrderOptionsEnum.ASCENDING // sortDirection
    ).pipe(
      map(result => {
        if (result && result.productWarehouseStockReceiptEntries) {
          return result.productWarehouseStockReceiptEntries.filter(item =>
            item.referenceNo && item.referenceNo.toLowerCase().includes(value.toLowerCase())
          );
        }
        return [];
      })
    );
  }

  private _loadInitialPurchaseOrder(purchaseOrderId: number): void {
    // If we have an initial value, we need to load the purchase order to display it properly
    this._subscription.add(
      this._productService.getProductWarehouseStockReceiptEntries(
        '',
        0, // supplierId
        '', // dateFrom
        '', // dateTo
        0, // skip
        100, // take
        'referenceNo', // sortField
        SortOrderOptionsEnum.ASCENDING // sortDirection
      ).subscribe(result => {
        if (result && result.productWarehouseStockReceiptEntries) {
          const purchaseOrder = result.productWarehouseStockReceiptEntries.find(po => po.id === purchaseOrderId);
          if (purchaseOrder) {
            this.selectedPurchaseOrder = purchaseOrder;
            this.purchaseOrderReferenceNoControl.setValue(purchaseOrder);
          }
        }
      })
    );
  }

  displayPurchaseOrderReferenceNo(purchaseOrder: ProductWarehouseStockReceiptEntry): string {
    return purchaseOrder ? purchaseOrder.referenceNo : '';
  }

  onPurchaseOrderSelected(purchaseOrder: ProductWarehouseStockReceiptEntry): void {
    this.selectedPurchaseOrder = purchaseOrder;
    this._notifyValueChange(purchaseOrder.id);
  }

  clearSelection(): void {
    this.purchaseOrderReferenceNoControl.setValue('');
    this.selectedPurchaseOrder = null;
    this._notifyValueChange(null);
    // Explicitly enable related controls when clearing selection
    this._enableRelatedControls();
  }

  private _updateSupplierControl(supplierId: number): void {
    // Find the supplier autocomplete control
    const supplierControl = this.otherControls.find(control =>
      control.name === 'SupplierAutocompleteControl'
    );


    if (supplierControl && supplierControl.componentInstance && supplierId) {
      // Update the supplier control value
      supplierControl.componentInstance.value(supplierId);
    }
  }

  private _updateDatePickerControls(stockEntryDate: Date): void {
    // Find the start date picker control
    const startDateControl = this.otherControls.find(control =>
      control.name === 'StartDatePickerControl'
    );

    // Find the end date picker control
    const endDateControl = this.otherControls.find(control =>
      control.name === 'EndDatePickerControl'
    );

    if (stockEntryDate) {
      const entryDate = new Date(stockEntryDate);

      // Update start date control
      if (startDateControl && startDateControl.componentInstance) {
        if (startDateControl.componentInstance.form) {
          // For form-based date picker controls
          startDateControl.componentInstance.form.get('date')?.setValue(entryDate);
        } else if (startDateControl.componentInstance.value) {
          // For value-based date picker controls
          startDateControl.componentInstance.value(entryDate);
        }
      }

      // Update end date control
      if (endDateControl && endDateControl.componentInstance) {
        if (endDateControl.componentInstance.form) {
          // For form-based date picker controls
          endDateControl.componentInstance.form.get('date')?.setValue(entryDate);
        } else if (endDateControl.componentInstance.value) {
          // For value-based date picker controls
          endDateControl.componentInstance.value(entryDate);
        }
      }
    }
  }

  private _disableRelatedControls(): void {
    // Disable supplier control
    const supplierControl = this.otherControls.find(control =>
      control.name === 'SupplierAutocompleteControl'
    );
    if (supplierControl && supplierControl.componentInstance) {
      if (supplierControl.componentInstance.supplierControl) {
        supplierControl.componentInstance.supplierControl.disable();
      }
    }

    // Disable start date control
    const startDateControl = this.otherControls.find(control =>
      control.name === 'StartDatePickerControl'
    );
    if (startDateControl && startDateControl.componentInstance) {
      if (startDateControl.componentInstance.form) {
        startDateControl.componentInstance.form.get('date')?.disable();
      }
    }

    // Disable end date control
    const endDateControl = this.otherControls.find(control =>
      control.name === 'EndDatePickerControl'
    );
    if (endDateControl && endDateControl.componentInstance) {
      if (endDateControl.componentInstance.form) {
        endDateControl.componentInstance.form.get('date')?.disable();
      }
    }
  }
  private _enableRelatedControls(): void {
    // Enable supplier control
    const supplierControl = this.otherControls.find(control =>
      control.name === 'SupplierAutocompleteControl'
    );
    if (supplierControl && supplierControl.componentInstance) {
      if (supplierControl.componentInstance.supplierControl) {
        supplierControl.componentInstance.supplierControl.enable();
      }
    }

    // Enable start date control
    const startDateControl = this.otherControls.find(control =>
      control.name === 'StartDatePickerControl'
    );
    if (startDateControl && startDateControl.componentInstance) {
      if (startDateControl.componentInstance.form) {
        startDateControl.componentInstance.form.get('date')?.enable();
      }
    }

    // Enable end date control
    const endDateControl = this.otherControls.find(control =>
      control.name === 'EndDatePickerControl'
    );
    if (endDateControl && endDateControl.componentInstance) {
      if (endDateControl.componentInstance.form) {
        endDateControl.componentInstance.form.get('date')?.enable();
      }
    }
  }
}
