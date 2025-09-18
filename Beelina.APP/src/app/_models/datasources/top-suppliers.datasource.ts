import { DestroyRef, effect, inject } from '@angular/core';

import { BaseDataSource } from './base.datasource';
import { TopSupplierBySales } from '../top-supplier-by-sales';
import { TopSupplierStore } from 'src/app/admin-dashboard/insights/top-suppliers-list/top-suppliers.store';

export class TopSuppliersDataSource extends BaseDataSource<TopSupplierBySales> {

  private destroyRef = inject(DestroyRef);
  topSuppliersStore = inject(TopSupplierStore);

  constructor() {
    super();
    this.topSuppliersStore.getTopSuppliersBySales();

    const effectRef = effect(() => {
      this._dataStream.next(this.topSuppliersStore.topSuppliersBySales());
    });

    this.destroyRef.onDestroy(() => {
      effectRef.destroy();
    });
  }

  override fetchData() {
    this.topSuppliersStore.getTopSuppliersBySales();
  }
}
