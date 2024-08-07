import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';
import { IProductTransactionInput } from './iproduct-transaction.input';

export interface ITransactionInput {
  id: number;
  invoiceNo: string;
  discount: number;
  storeId: number;
  modeOfPayment: number;
  paid: boolean;
  transactionDate: string;
  dueDate: string;
  status: TransactionStatusEnum;
  productTransactionInputs: Array<IProductTransactionInput>;
}
