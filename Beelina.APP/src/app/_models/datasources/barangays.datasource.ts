import { Store, select } from '@ngrx/store';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { barangaysSelector } from 'src/app/barangays/store/selectors';
import * as BarangayActions from '../../barangays/store/actions';
import { Barangay } from '../barangay';
import { BaseDataSource } from './base.datasource';

export class BarangaysDataSource extends BaseDataSource<Barangay> {
  constructor(override store: Store<AppStateInterface>) {
    super(store);

    this.store.dispatch(BarangayActions.getBarangaysAction());

    this._subscription.add(
      this.store
        .pipe(select(barangaysSelector))
        .subscribe((barangays: Array<Barangay>) => {
          this._dataStream.next(barangays);
        })
    );
  }

  override fetchData() {
    this.store.dispatch(BarangayActions.getBarangaysAction());
  }
}
