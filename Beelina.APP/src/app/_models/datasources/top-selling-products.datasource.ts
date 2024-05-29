import { Store, select } from '@ngrx/store';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import * as TopSellingProductsStoreActions from '../../product/top-products/store/actions';

import { BaseDataSource } from './base.datasource';

import { TopSellingProduct } from 'src/app/_services/transaction.service';
import { topSellingProductsSelector } from 'src/app/product/top-products/store/selectors';

export class TopSellingProductsDataSource extends BaseDataSource<TopSellingProduct> {

  constructor(
    protected store: Store<AppStateInterface>,
    protected userId: number
  ) {
    super();

    this.store.dispatch(
      TopSellingProductsStoreActions.getTopSellingProductsAction({
        userId: this.userId,
      })
    );

    this._subscription.add(
      this.store
        .pipe(select(topSellingProductsSelector))
        .subscribe((topSellingProducts: Array<TopSellingProduct>) => {
          this._dataStream.next(topSellingProducts);
        })
    );
  }

  override fetchData() {
    this.store.dispatch(
      TopSellingProductsStoreActions.getTopSellingProductsAction({
        userId: this.userId,
      })
    );
  }
}
