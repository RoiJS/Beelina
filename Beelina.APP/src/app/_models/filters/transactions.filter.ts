import { PaymentStatusEnum } from "src/app/_enum/payment-status.enum";
import { TransactionStatusEnum } from "src/app/_enum/transaction-status.enum";
import { DateFormatter } from "src/app/_helpers/formatters/date-formatter.helper";

export class TransactionsFilter {
  public status: TransactionStatusEnum;
  public dateFrom: string;
  public dateTo: string;
  public paymentStatus: PaymentStatusEnum;
  public storeId: number;
  public salesAgentId: number;

  constructor() {
    this.status = TransactionStatusEnum.ALL;
    this.dateFrom = DateFormatter.format(new Date());
    this.dateTo = DateFormatter.format(new Date());
    this.paymentStatus = PaymentStatusEnum.All;
    this.storeId = 0; // Default to 0 for all stores
    this.salesAgentId = 0; // Default to 0 for all sales agents
  }

  isActive() {
    return this.status !== TransactionStatusEnum.ALL ||
    this.dateFrom !== DateFormatter.format(new Date()) ||
    this.dateTo !== DateFormatter.format(new Date()) ||
    this.paymentStatus !== PaymentStatusEnum.All ||
    this.storeId !== 0 || // Check if storeId is set to a specific store
    this.salesAgentId !== 0; // Check if salesAgentId is set to a specific agent
  }

  reset() {
    this.status = TransactionStatusEnum.ALL;
    this.dateFrom = DateFormatter.format(new Date());
    this.dateTo = DateFormatter.format(new Date());
    this.paymentStatus = PaymentStatusEnum.All;
    this.storeId = 0; // Reset to 0 for all stores
    this.salesAgentId = 0; // Reset to 0 for all sales agents
  }
}
