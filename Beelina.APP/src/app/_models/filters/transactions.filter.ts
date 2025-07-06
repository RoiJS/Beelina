import { PaymentStatusEnum } from "src/app/_enum/payment-status.enum";
import { TransactionStatusEnum } from "src/app/_enum/transaction-status.enum";

export class TransactionsFilter {
  public status: TransactionStatusEnum;
  public transactionDate: string;
  public paymentStatus: PaymentStatusEnum;
  public storeId: number;

  constructor() {
    this.status = TransactionStatusEnum.ALL;
    this.transactionDate = '';
    this.paymentStatus = PaymentStatusEnum.All;
    this.storeId = 0; // Default to 0 for all stores
  }

  isActive() {
    return this.status !== TransactionStatusEnum.ALL ||
    this.transactionDate !== '' ||
    this.paymentStatus !== PaymentStatusEnum.All ||
    this.storeId !== 0; // Check if storeId is set to a specific store
  }

  reset() {
    this.status = TransactionStatusEnum.ALL;
    this.transactionDate = '';
    this.paymentStatus = PaymentStatusEnum.All;
    this.storeId = 0; // Reset to 0 for all stores
  }
}
