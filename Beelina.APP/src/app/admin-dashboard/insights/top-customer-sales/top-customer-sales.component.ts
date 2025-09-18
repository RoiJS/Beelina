import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { TransactionService, CustomerSaleProduct } from 'src/app/_services/transaction.service';
import { TopCustomerSalesFilterService } from 'src/app/_services/top-customer-sales-filter.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { isLoadingSelector } from 'src/app/transaction-history/store/selectors';
import { TopCustomerSalesDataSource } from 'src/app/_models/datasources/top-customer-sales.datasource';
import { TopCustomerSalesStore } from './top-customer-sales.store';
import { SkeletonTypeEnum } from 'src/app/shared/ui/insight-skeleton/insight-skeleton.component';

@Component({
  selector: 'app-top-customer-sales',
  templateUrl: './top-customer-sales.component.html',
  styleUrls: ['./top-customer-sales.component.scss']
})
export class TopCustomerSalesComponent extends BaseComponent implements OnInit, OnDestroy {

  private _customerSalesProducts: Array<CustomerSaleProduct> = [];
  private _subscription = new Subscription();

  authService = inject(AuthService);
  bottomSheet = inject(MatBottomSheet);
  store = inject(Store<AppStateInterface>);
  storageService = inject(StorageService);
  transactionService = inject(TransactionService);
  topCustomerSalesFilterService = inject(TopCustomerSalesFilterService);
  topCustomerSalesStore = inject(TopCustomerSalesStore);

  constructor() {
    super();

    this.$isLoading = this.store.pipe(select(isLoadingSelector));

    this.topCustomerSalesFilterService
      .setBottomSheet(this.bottomSheet)
      .setProps(
        'admin_dateStart_customerSalesInsightsPage',
        'admin_dateEnd_customerSalesInsightsPage',
        'admin_sortOrder_customerSalesInsightsPage'
      )
      .setDataSource(
        new TopCustomerSalesDataSource()
      );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.topCustomerSalesFilterService.destroy();
    this._subscription.unsubscribe();
  }

  get dataSource(): TopCustomerSalesDataSource {
    return <TopCustomerSalesDataSource>this.topCustomerSalesFilterService.dataSource;
  }

  openFilter() {
    this.topCustomerSalesFilterService.openFilter();
  }

  get isFilterActive(): boolean {
    return this.topCustomerSalesFilterService.isFilterActive;
  }

  showTopProducts(storeId: number) {
    this._subscription.add(this.transactionService
      .getStoresSalesProducts(storeId)
      .subscribe((data: Array<CustomerSaleProduct>) => {
        this._customerSalesProducts = data;
      }));
  }

  goBack() {
    this._customerSalesProducts = [];
  }

  get customerSalesProducts(): Array<CustomerSaleProduct> {
    return this._customerSalesProducts;
  }

  override get isLoading(): boolean {
    return this.topCustomerSalesStore.isLoading();
  }

  get skeletonTypeEnum() {
    return SkeletonTypeEnum;
  }
}
