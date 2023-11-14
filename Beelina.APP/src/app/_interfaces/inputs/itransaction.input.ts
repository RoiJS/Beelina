import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';
import { IProductTransactionInput } from './iproduct-transaction.input';

export interface ITransactionInput {
  id: number;
  invoiceNo: string;
  storeId: number;
  transactionDate: string;
  status: TransactionStatusEnum;
  productTransactionInputs: Array<IProductTransactionInput>;
}
