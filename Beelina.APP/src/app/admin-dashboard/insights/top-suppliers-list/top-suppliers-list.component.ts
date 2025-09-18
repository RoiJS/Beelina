import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Store, select } from '@ngrx/store';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { AuthService } from 'src/app/_services/auth.service';
import { SupplierService } from 'src/app/_services/supplier.service';
import { StorageService } from 'src/app/_services/storage.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { isLoadingSelector } from 'src/app/transaction-history/store/selectors';
import { TopSuppliersFilterService } from 'src/app/_services/top-suppliers-filter.service';
import { TopSuppliersDataSource } from 'src/app/_models/datasources/top-suppliers.datasource';
import { TopSupplierStore } from './top-suppliers.store';
import { SkeletonTypeEnum } from 'src/app/shared/ui/insight-skeleton/insight-skeleton.component';

@Component({
  selector: 'app-top-suppliers-list',
  templateUrl: './top-suppliers-list.component.html',
  styleUrls: ['./top-suppliers-list.component.scss']
})
export class TopSuppliersListComponent extends BaseComponent implements OnDestroy {

  authService = inject(AuthService);
  bottomSheet = inject(MatBottomSheet);
  store = inject(Store<AppStateInterface>);
  storageService = inject(StorageService);
  supplierService = inject(SupplierService);
  topSuppliersFilterService = inject(TopSuppliersFilterService);
  topSupplierStore = inject(TopSupplierStore);

  constructor() {
    super();

    this.$isLoading = this.store.pipe(select(isLoadingSelector));

    this.topSuppliersFilterService
      .setBottomSheet(this.bottomSheet)
      .setProps(
        'admin_dateStart_suppliersInsightsPage',
        'admin_dateEnd_suppliersInsightsPage',
        'admin_sortOrder_suppliersInsightsPage'
      )
      .setDataSource(
        new TopSuppliersDataSource()
      );
  }

  ngOnDestroy() {
    this.topSuppliersFilterService.destroy();
  }

  get dataSource(): TopSuppliersDataSource {
    return <TopSuppliersDataSource>this.topSuppliersFilterService.dataSource;
  }

  openFilter() {
    this.topSuppliersFilterService.openFilter();
  }

  get isFilterActive(): boolean {
    return this.topSuppliersFilterService.isFilterActive;
  }

  override get isLoading(): boolean {
    return this.topSupplierStore.isLoading();
  }

  get skeletonTypeEnum() {
    return SkeletonTypeEnum;
  }
}
