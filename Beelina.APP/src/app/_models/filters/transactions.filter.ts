import { PaymentStatusEnum } from "src/app/_enum/payment-status.enum";
import { TransactionStatusEnum } from "src/app/_enum/transaction-status.enum";

export class TransactionsFilter {
  public status: TransactionStatusEnum;
  public transactionDate: string;
  public paymentStatus: PaymentStatusEnum;

  constructor() {
    this.status = TransactionStatusEnum.ALL;
    this.transactionDate = '';
    this.paymentStatus = PaymentStatusEnum.All;
  }

  isActive() {
    return this.status !== TransactionStatusEnum.ALL ||
    this.transactionDate !== '' ||
    this.paymentStatus !== PaymentStatusEnum.All;
  }

  reset() {
    this.status = TransactionStatusEnum.ALL;
    this.transactionDate = '';
    this.paymentStatus = PaymentStatusEnum.All;
  }
}
