import { IBaseState } from 'src/app/_interfaces/states/ibase.state';
import { ProductTransaction, Transaction } from 'src/app/_models/transaction';

export interface IProductTransactionState extends IBaseState {
  currentIdx: number;
  productTransactions: Array<ProductTransaction>;
  transaction: Transaction;
}
