import { Store, select } from '@ngrx/store';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { transactionDatesSelector } from 'src/app/transaction-history/store/selectors';
import * as TransactionDateStoreActions from '../../transaction-history/store/actions';
import { BaseDataSource } from './base.datasource';

import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';
import { TransactionDateInformation } from 'src/app/_services/transaction.service';

export class TransactionDatesDataSource extends BaseDataSource<TransactionDateInformation> {
  protected transactionStatus: TransactionStatusEnum;

  constructor(
    override store: Store<AppStateInterface>,
    transactionStatus: TransactionStatusEnum
  ) {
    super(store);

    this.transactionStatus = transactionStatus;
    this.store.dispatch(
      TransactionDateStoreActions.getTransactionDatesAction({
        transactionStatus: this.transactionStatus,
      })
    );

    this._subscription.add(
      this.store
        .pipe(select(transactionDatesSelector))
        .subscribe((transactionDates: Array<TransactionDateInformation>) => {
          this._dataStream.next(transactionDates);
        })
    );
  }

  override fetchData() {
    this.store.dispatch(
      TransactionDateStoreActions.getTransactionDatesAction({
        transactionStatus: this.transactionStatus,
      })
    );
  }
}
