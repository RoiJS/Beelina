import { IBaseState } from 'src/app/payment-methods/types/payment-method-state.interface';
import { ProductTransaction } from 'src/app/_models/transaction';

export interface IProductTransactionState extends IBaseState {
  currentIdx: number;
  productTransactions: Array<ProductTransaction>;
}
