import { Store, select } from '@ngrx/store';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { productStockAuditsSelector } from '../../product/edit-product-details/manage-product-stock-audit/store/selectors';
import * as ProductStockAuditsStoreActions from '../../product/edit-product-details/manage-product-stock-audit/store/actions';
import { BaseDataSource } from './base.datasource';

import { ProductStockAudit } from '../product-stock-audit';

export class ProductStockAuditsDatasource extends BaseDataSource<ProductStockAudit> {

  constructor(
    override store: Store<AppStateInterface>,
    protected productId: number,
    protected userAccountId: number
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
        .subscribe((productStockAudits: Array<ProductStockAudit>) => {
          this._dataStream.next(productStockAudits);
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
