import { TransactionDatesDataSource } from 'src/app/_models/datasources/transaction-dates.datasource';

export interface IFilterAndSortTransactions {
  openFilter(): void;
  dataSource: TransactionDatesDataSource;
  isFilterActive: boolean;
}
