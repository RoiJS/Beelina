import { Component, inject, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { ProductStockAuditsDatasource } from 'src/app/_models/datasources/product-stock-audits.datasource';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

import * as ProductStockAuditsActions from '../../../product/edit-product-details/manage-product-stock-audit/store/actions';
import { StockAuditFilterService } from 'src/app/_services/stock-audit-filter.service';

@Component({
  selector: 'app-product-stock-audit',
  templateUrl: './product-stock-audit.component.html',
  styleUrls: ['./product-stock-audit.component.scss']
})
export class ProductStockAuditComponent extends BaseComponent implements OnDestroy {

  private bottomSheet = inject(MatBottomSheet);
  private store = inject(Store<AppStateInterface>);
  private stockAuditFilterService = inject(StockAuditFilterService);

  constructor() {
    super();
  }

  ngOnDestroy() {
    this.store.dispatch(
      ProductStockAuditsActions.resetProductStockAuditItemsState()
    );
  }

  resetStockAuditList() {
    this.store.dispatch(
      ProductStockAuditsActions.resetProductStockAuditItemsState()
    );
  }

  initStockAuditList(id: number, userId: number) {
    this.store.dispatch(
      ProductStockAuditsActions.resetProductStockAuditItemsState()
    );
    this.stockAuditFilterService
      .setBottomSheet(this.bottomSheet)
      .setProps(
        `admin_dateStart_stockAuditItemsPage_${id}`,
        `admin_dateEnd_stockAuditItemsPage_${id}`,
        `admin_sortOrder_stockAuditItemsPage_${id}`
      )
      .setDataSource(
        new ProductStockAuditsDatasource(
          this.store,
          id,
          userId,
        )
      );
  }

  openFilter() {
    this.stockAuditFilterService.openFilter();
  }

  get isFilterActive(): boolean {
    return this.stockAuditFilterService.isFilterActive;
  }

  get productStockAuditDataSource(): ProductStockAuditsDatasource {
    return <ProductStockAuditsDatasource>this.stockAuditFilterService.dataSource;
  }
}
