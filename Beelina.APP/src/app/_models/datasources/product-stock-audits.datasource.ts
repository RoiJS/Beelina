import { Store, select } from '@ngrx/store';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { productStockAuditsSelector } from '../../product/edit-product-details/manage-product-stock-audit/store/selectors';
import * as ProductStockAuditsStoreActions from '../../product/edit-product-details/manage-product-stock-audit/store/actions';
import { BaseDataSource } from './base.datasource';

import { ProductStockAuditItem } from '../product-stock-audit-item';

export class ProductStockAuditsDatasource extends BaseDataSource<ProductStockAuditItem> {

  constructor(
    override store: Store<AppStateInterface>,
    protected productId: number,
    protected userAccountId: number,
  ) {
    super(store);

    this.store.dispatch(
      ProductStockAuditsStoreActions.getProductStockAuditsAction({
        productId, userAccountId
      })
    );

    this._subscription.add(
      this.store
        .pipe(select(productStockAuditsSelector))
        .subscribe((productStockAuditItems: Array<ProductStockAuditItem>) => {
          this._dataStream.next(productStockAuditItems);
        })
    );
  }

  override fetchData() {
    this.store.dispatch(
      ProductStockAuditsStoreActions.getProductStockAuditsAction({
        productId: this.productId,
        userAccountId: this.userAccountId,
      })
    );
  }
}
