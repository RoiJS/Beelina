import { Store, select } from '@ngrx/store';

import { Product } from '../product';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import * as WarehouseProductActions from '../../warehouse/store/actions';

import { BaseDataSource } from './base.datasource';
import { productsSelector } from 'src/app/warehouse/store/selectors';

export class WarehouseProductDataSource extends BaseDataSource<Product> {

  constructor(protected store: Store<AppStateInterface>) {
    super();
    this._pageSize = 50;
    this.store.dispatch(WarehouseProductActions.getWarehouseProductsAction());

    this._subscription.add(
      this.store
        .pipe(select(productsSelector))
        .subscribe((products: Array<Product>) => {
          this._dataStream.next(products);
        })
    );
  }

  override fetchData() {
    this.store.dispatch(WarehouseProductActions.getWarehouseProductsAction());
  }
}
