import { TransactionStatusEnum } from "src/app/_enum/transaction-status.enum";

export class TransactionsFilter {
  public status: TransactionStatusEnum;
  public transactionDate: string;

  constructor() {
    this.status = TransactionStatusEnum.ALL;
    this.transactionDate = '';
  }

  isActive() {
    return this.status !== TransactionStatusEnum.ALL || this.transactionDate !== '';
  }

  reset() {
    this.status = TransactionStatusEnum.ALL;
    this.transactionDate = '';
  }
}
