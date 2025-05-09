import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Store, select } from '@ngrx/store';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { TopSellingProductsDataSource } from 'src/app/_models/datasources/top-selling-products.datasource';
import { AuthService } from 'src/app/_services/auth.service';
import { TopSellingProductsFilterService } from 'src/app/_services/top-selling-products-filter.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { isLoadingSelector } from 'src/app/transaction-history/store/selectors';
import * as TopSellingProductActions from '../../../product/top-products/store/actions';

@Component({
  selector: 'app-top-selling-products-list',
  templateUrl: './top-selling-products-list.component.html',
  styleUrls: ['./top-selling-products-list.component.scss']
})
export class TopSellingProductsListComponent extends BaseComponent implements OnInit, OnDestroy {

  authService = inject(AuthService);
  store = inject(Store<AppStateInterface>);
  bottomSheet = inject(MatBottomSheet);
  topSellingProductsFilterService = inject(TopSellingProductsFilterService);

  constructor() {
    super();

    this.$isLoading = this.store.pipe(select(isLoadingSelector));

    this.topSellingProductsFilterService
      .setBottomSheet(this.bottomSheet)
      .setProps(
        'admin_dateStart_insightsPage',
        'admin_dateEnd_insightsPage',
        'admin_sortOrder_insightsPage'
      )
      .setDataSource(
        new TopSellingProductsDataSource(
          this.store,
          this.authService.userId
        )
      );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.store.dispatch(
      TopSellingProductActions.resetTopSellingProductState()
    );
    this.topSellingProductsFilterService.destroy();
  }

  get dataSource(): TopSellingProductsDataSource {
    return <TopSellingProductsDataSource>this.topSellingProductsFilterService.dataSource;
  }

  openFilter() {
    this.topSellingProductsFilterService.openFilter();
  }

  get isFilterActive(): boolean {
    return this.topSellingProductsFilterService.isFilterActive;
  }
}
