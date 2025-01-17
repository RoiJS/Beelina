import { AfterViewInit, Component, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';

import { SortOrderOptionsEnum } from '../_enum/sort-order-options.enum';
import { PurchaseOrderFilter } from '../_models/filters/purchase-order.filter';
import { ProductWarehouseStockReceiptEntry } from '../_models/product-warehouse-stock-receipt-entry';
import { ProductWarehouseStockReceiptEntriesStore } from './product-warehouse-stock-receipt-entries.store';
import { PurchaseOrdersFilterComponent } from './purchase-orders-filter/purchase-orders-filter.component';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';

@Component({
  selector: 'app-purchase-orders',
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.scss']
})
export class PurchaseOrdersComponent implements OnInit, AfterViewInit {
  productWarehouseStockEntriesStore = inject(ProductWarehouseStockReceiptEntriesStore);

  bottomSheet = inject(MatBottomSheet);
  dataSource: ProductWarehouseStockReceiptEntry[] = [];
  purchaseOrdersFilter = signal<PurchaseOrderFilter>(new PurchaseOrderFilter());

  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);

  _dialogOpenFilterRef: MatBottomSheetRef<
    PurchaseOrdersFilterComponent,
    {
      startDate: Date;
      endDate: Date;
    }
  >;

  constructor() {
    effect(() => {
      this.dataSource = this.productWarehouseStockEntriesStore.productWarehouseStockReceiptEntries();
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.productWarehouseStockEntriesStore.setSort(this.sort().active, <SortOrderOptionsEnum>this.sort().direction.toUpperCase());
    this.productWarehouseStockEntriesStore.setPagination(this.paginator().pageIndex, this.paginator().pageSize);
    this.productWarehouseStockEntriesStore.getProductWarehouseStockReceiptEntries();
  }

  onPageChange(e: PageEvent) {
    if (this.productWarehouseStockEntriesStore.take() !== e.pageSize) {
      this.productWarehouseStockEntriesStore.setPagination(0, e.pageSize);
    } else {
      this.productWarehouseStockEntriesStore.setPagination(e.pageIndex * e.pageSize, e.pageSize);
    }

    this.productWarehouseStockEntriesStore.getProductWarehouseStockReceiptEntries();
  }

  onSearch(filterKeyword: string) {
    this.productWarehouseStockEntriesStore.reset();
    this.productWarehouseStockEntriesStore.setSearchFilterKeyword(filterKeyword);
    this.productWarehouseStockEntriesStore.setSort(this.sort().active, <SortOrderOptionsEnum>this.sort().direction.toUpperCase());
    this.productWarehouseStockEntriesStore.getProductWarehouseStockReceiptEntries();
  }

  onClear() {
    this.onSearch('');
  }

  onSortChange(e: Sort) {
    this.productWarehouseStockEntriesStore.setSort(this.sort().active, <SortOrderOptionsEnum>this.sort().direction.toUpperCase());
    this.productWarehouseStockEntriesStore.getProductWarehouseStockReceiptEntries();
  }

  openFilter() {
    this._dialogOpenFilterRef = this.bottomSheet.open(PurchaseOrdersFilterComponent, {
      data: this.purchaseOrdersFilter()
    });

    this._dialogOpenFilterRef
      .afterDismissed()
      .subscribe(
        (data: {
          endDate: Date;
          startDate: Date;
        }) => {
          if (!data) return;

          this.purchaseOrdersFilter.update(() => {
            const newPurchaseOrderFilter = new PurchaseOrderFilter();
            newPurchaseOrderFilter.startDate = DateFormatter.format(data.startDate);
            newPurchaseOrderFilter.endDate = DateFormatter.format(data.endDate);
            return newPurchaseOrderFilter;
          });

          this.productWarehouseStockEntriesStore.resetList();
          this.productWarehouseStockEntriesStore.setDateFilters(this.purchaseOrdersFilter().startDate, this.purchaseOrdersFilter().endDate);
          this.productWarehouseStockEntriesStore.getProductWarehouseStockReceiptEntries();
        });
  }

  get columnDefinition(): string[] {
    return ['stockEntryDate', 'referenceNo', 'plateNo', 'supplierName'];
  }

}
