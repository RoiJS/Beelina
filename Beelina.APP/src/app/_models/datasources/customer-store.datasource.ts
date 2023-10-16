import { Store, select } from '@ngrx/store';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { customerStoresSelector } from 'src/app/customer/store/selectors';
import * as CustomerStoreActions from '../../customer/store/actions';
import { CustomerStore } from '../customer-store';
import { BaseDataSource } from './base.datasource';

export class CustomerStoreDataSource extends BaseDataSource<CustomerStore> {
  constructor(
    override store: Store<AppStateInterface>,
    private barangayName: string
  ) {
    super(store);

    this.store.dispatch(
      CustomerStoreActions.getCustomerStorePerBarangayAction({ barangayName })
    );

    this._subscription.add(
      this.store
        .pipe(select(customerStoresSelector))
        .subscribe((customerStores: Array<CustomerStore>) => {
          this._dataStream.next(customerStores);
        })
    );
  }

  override fetchData() {
    this.store.dispatch(
      CustomerStoreActions.getCustomerStorePerBarangayAction({
        barangayName: this.barangayName,
      })
    );
  }
}
