import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Store, select } from '@ngrx/store';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { AuthService } from 'src/app/_services/auth.service';

import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { isLoadingSelector } from './store/selectors';
import { TopSellingProductsDataSource } from 'src/app/_models/datasources/top-selling-products.datasource';
import * as TopSellingProductActions from './store/actions';
import { TopSellingProductsFilterService } from 'src/app/_services/top-selling-products-filter.service';

@Component({
  selector: 'app-top-products',
  templateUrl: './top-products.component.html',
  styleUrls: ['./top-products.component.scss'],
})
export class TopProductsComponent extends BaseComponent implements OnInit, OnDestroy {

  constructor(
    private authService: AuthService,
    private store: Store<AppStateInterface>,
    private bottomSheet: MatBottomSheet,
    private topSellingProductsFilterService: TopSellingProductsFilterService
  ) {
    super();

    this.$isLoading = this.store.pipe(select(isLoadingSelector));

    this.topSellingProductsFilterService
      .setBottomSheet(this.bottomSheet)
      .setProps(
        'dateStart_insightsPage',
        'dateEnd_insightsPage',
        'sortOrder_insightsPage'
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
}
