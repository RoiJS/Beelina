import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { ProductStockAuditsDatasource } from 'src/app/_models/datasources/product-stock-audits.datasource';
import { StorageService } from 'src/app/_services/storage.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

import * as ProductStockAuditsActions from '../manage-product-stock-audit/store/actions';
import { isLoadingSelector } from './store/selectors';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { StockAuditFilterService } from 'src/app/_services/stock-audit-filter.service';

@Component({
  selector: 'app-manage-product-stock-audit',
  templateUrl: './manage-product-stock-audit.component.html',
  styleUrls: ['./manage-product-stock-audit.component.scss']
})
export class ManageProductStockAuditComponent extends BaseComponent implements OnInit, OnDestroy {

  private _dataSource: ProductStockAuditsDatasource;
  private _productId: number;
  private _userAccountId: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store<AppStateInterface>,
    private storageService: StorageService,
    private bottomSheet: MatBottomSheet,
    private stockAuditFilterService: StockAuditFilterService
  ) {
    super();
    this._productId = +this.activatedRoute.snapshot.paramMap.get('id');
    this._userAccountId = +this.storageService.getString('currentSalesAgentId');

    this.stockAuditFilterService
      .setBottomSheet(this.bottomSheet)
      .setProps(
        `dateStart_stockAuditItemsPage_${this._productId}`,
        `dateEnd_stockAuditItemsPage_${this._productId}`,
        `sortOrder_stockAuditItemsPage_${this._productId}`
      )
      .setDataSource(
        new ProductStockAuditsDatasource(
          this.store,
          this._productId,
          this._userAccountId,
        )
      );

    this.$isLoading = this.store.pipe(select(isLoadingSelector));
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.store.dispatch(
      ProductStockAuditsActions.resetProductStockAuditItemsState()
    );
    this.stockAuditFilterService.destroy();
  }

  openFilter() {
    this.stockAuditFilterService.openFilter();
  }

  get dataSource(): ProductStockAuditsDatasource {
    return <ProductStockAuditsDatasource>this.stockAuditFilterService.dataSource;
  }

  get isFilterActive(): boolean {
    return this.stockAuditFilterService.isFilterActive;
  }
}
