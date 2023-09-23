import { Store, select } from '@ngrx/store';

import { Product } from '../product';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import * as ProductActions from '../../product/store/actions';
import { productsSelector } from 'src/app/product/store/selectors';

import { BaseDataSource } from './base.datasource';

export class ProductDataSource extends BaseDataSource<Product> {
  constructor(override store: Store<AppStateInterface>) {
    super(store);

    this.store.dispatch(ProductActions.getProductsAction());

    this._subscription.add(
      this.store
        .pipe(select(productsSelector))
        .subscribe((products: Array<Product>) => {
          this._dataStream.next(products);
        })
    );
  }

  override fetchData() {
    this.store.dispatch(ProductActions.getProductsAction());
  }
}
