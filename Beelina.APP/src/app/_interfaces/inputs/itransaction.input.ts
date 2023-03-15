import { IProductTransactionInput } from './iproduct-transaction.input';

export interface ITransactionInput {
  id: number;
  storeId: number;
  transactionDate: string;
  productTransactionInputs: Array<IProductTransactionInput>;
}
