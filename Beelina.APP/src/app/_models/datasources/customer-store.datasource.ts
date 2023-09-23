import { Store, select } from '@ngrx/store';

import { CustomerStore } from '../customer-store';
import { BaseDataSource } from './base.datasource';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { customerStoresSelector } from 'src/app/customer/store/selectors';
import * as CustomerStoreActions from '../../customer/store/actions';

export class CustomerStoreDataSource extends BaseDataSource<CustomerStore> {
  constructor(override store: Store<AppStateInterface>) {
    super(store);

    this.store.dispatch(CustomerStoreActions.getCustomerStoreAction());

    this._subscription.add(
      this.store
        .pipe(select(customerStoresSelector))
        .subscribe((customerStores: Array<CustomerStore>) => {
          this._dataStream.next(customerStores);
        })
    );
  }

  override fetchData() {
    this.store.dispatch(CustomerStoreActions.getCustomerStoreAction());
  }
}
