import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { ProductStockAuditsDatasource } from 'src/app/_models/datasources/product-stock-audits.datasource';
import { StorageService } from 'src/app/_services/storage.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

import * as ProductStockAuditsActions from '../manage-product-stock-audit/store/actions';
import { isLoadingSelector } from './store/selectors';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { StockAuditFilterService } from 'src/app/_services/stock-audit-filter.service';
import { ProductSourceEnum } from 'src/app/_enum/product-source.enum';
import { WarehouseProductStockAuditsDatasource } from 'src/app/_models/datasources/warehouse-product-stock-audits.datasource';

@Component({
  selector: 'app-manage-product-stock-audit',
  templateUrl: './manage-product-stock-audit.component.html',
  styleUrls: ['./manage-product-stock-audit.component.scss']
})
export class ManageProductStockAuditComponent extends BaseComponent implements OnInit, OnDestroy {

  private _productId: number;
  private _warehouseId: number = 1;
  private _userAccountId: number;
  private _productSource: ProductSourceEnum;

  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store<AppStateInterface>,
    private storageService: StorageService,
    private bottomSheet: MatBottomSheet,
    private router: Router,
    private stockAuditFilterService: StockAuditFilterService
  ) {
    super();
    const state = <any>this.router.getCurrentNavigation().extras.state;
    this._productSource = <ProductSourceEnum>state.productSource;
    this._productId = +this.activatedRoute.snapshot.paramMap.get('id');
    this._userAccountId = +this.storageService.getString('currentSalesAgentId');
    let dateStartKey = "", dateEndKey = "", sortOrderKey = "";
    let datasource = null;

    if (this._productSource === ProductSourceEnum.Panel) {
      dateStartKey = `dateStart_stockAuditItemsPage_${this._productId}`;
      dateEndKey = `dateEnd_stockAuditItemsPage_${this._productId}`;
      sortOrderKey = `sortOrder_stockAuditItemsPage_${this._productId}`;
      datasource = new ProductStockAuditsDatasource(
        this.store,
        this._productId,
        this._userAccountId,
      )
    } else {
      dateStartKey = `dateStart_warehouse_stockAuditItemsPage_${this._productId}`;
      dateEndKey = `dateEnd_warehouse_stockAuditItemsPage_${this._productId}`;
      sortOrderKey = `sortOrder_warehouse_stockAuditItemsPage_${this._productId}`;
      datasource = new WarehouseProductStockAuditsDatasource(
        this.store,
        this._productId,
        this._warehouseId,
      )
    }

    this.stockAuditFilterService
      .setBottomSheet(this.bottomSheet)
      .setProps(
        dateStartKey,
        dateEndKey,
        sortOrderKey
      )
      .setDataSource(datasource);

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
