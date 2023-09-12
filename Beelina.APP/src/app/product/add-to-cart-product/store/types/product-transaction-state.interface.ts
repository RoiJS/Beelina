import { IBaseState } from 'src/app/payment-methods/types/payment-method-state.interface';
import { ProductTransaction } from 'src/app/_models/transaction';
import { Transaction } from 'src/app/_services/transaction.service';

export interface IProductTransactionState extends IBaseState {
  currentIdx: number;
  productTransactions: Array<ProductTransaction>;
  transaction: Transaction;
}
