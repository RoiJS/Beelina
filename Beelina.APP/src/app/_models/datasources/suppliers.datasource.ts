
import { BaseDataSource } from './base.datasource';
import { Supplier } from '../supplier';
import { effect, inject } from '@angular/core';

import { SupplierStore } from 'src/app/suppliers/suppliers.store';

export class SuppliersDataSource extends BaseDataSource<Supplier> {
  suppliersStore = inject(SupplierStore);
  constructor() {
    super();
    this.suppliersStore.getSuppliers();
    effect(() => {
      this._dataStream.next(this.suppliersStore.suppliers());
    }, {
      allowSignalWrites: true
    });
  }

  override fetchData() {
    this.suppliersStore.getSuppliers();
  }
}
