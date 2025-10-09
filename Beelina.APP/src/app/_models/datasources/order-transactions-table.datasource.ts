import { MatTableDataSource } from '@angular/material/table';

import { Transaction } from '../transaction';

export class OrderTransactionTableDataSource extends MatTableDataSource<Transaction> {

  constructor(initialData: Transaction[] = []) {
    super(initialData);
  }

  updateData(transactions: Transaction[]) {
    this.data = transactions;
  }
}
