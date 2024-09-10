import { PaymenStatusEnum } from '../_enum/payment-status.enum';
import { TransactionStatusEnum } from '../_enum/transaction-status.enum';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';
import { IModelNode } from '../_interfaces/imodel-node';
import { Barangay } from './barangay';
import { CustomerStore } from './customer-store';
import { Entity } from './entity.model';
import { Product } from './product';
import { User } from './user.model';

export class Transaction extends Entity implements IModelNode {
  public storeId: number;
  public invoiceNo: string;
  public discount: number;
  public transactionDate: Date;
  public dueDate: Date;
  public createdById: number;
  public createdBy: string | User;
  public detailsUpdatedBy: string;
  public detailsDateUpdated: Date;
  public orderItemsDateUpdated: Date;
  public finalDateUpdated: Date;
  public store: CustomerStore;
  public barangay: Barangay;
  public modeOfPayment: number;
  public productTransactions: Array<ProductTransaction>;
  public hasUnpaidProductTransaction: boolean;
  public balance: number;
  public total: number;
  public badOrderAmount: number = 0;
  public status: TransactionStatusEnum;
  public isLocal: boolean;

  get transactionDateFormatted(): string {
    return DateFormatter.format(this.transactionDate, 'MMM DD, YYYY');
  }

  get finalDateUpdatedFormatted(): string {
    return DateFormatter.format(this.finalDateUpdated, 'MMM DD, YYYY hh:mm A');
  }

  get dueDateFormatted(): string {
    return DateFormatter.format(this.dueDate, 'MMM DD, YYYY');
  }

  get grossTotalFormatted(): string {
    return NumberFormatter.formatCurrency(this.total);
  }

  get badOrderFormatted(): string {
    return NumberFormatter.formatCurrency(this.badOrderAmount);
  }

  get netTotal(): number {
    const calculatedNetTotalAmount =
      (this.total - (this.discount / 100) * this.total) - this.badOrderAmount;
    return calculatedNetTotalAmount;
  }

  get netTotalFormatted(): string {
    return NumberFormatter.formatCurrency(this.netTotal);
  }

  get balanceFormatted(): string {
    return NumberFormatter.formatCurrency(this.balance);
  }

  get vatableAmount(): number {
    return NumberFormatter.roundToDecimalPlaces(this.netTotal / (1 + (this.vatPercentage / 100)), 2);
  }

  get valueAddedTax(): number {
    return this.netTotal - this.vatableAmount;
  }

  get vatPercentage(): number {
    return 12; // Default fix value for now
  }

  constructor() {
    super();
    this.productTransactions = new Array<ProductTransaction>();
    this.store = new CustomerStore();
    this.barangay = new Barangay();
  }
}

export class ProductTransaction extends Entity implements IModelNode {
  public code: string;
  public productId: number;
  public productName: string;
  public quantity: number;
  public currentQuantity: number;
  public price: number;
  public status: PaymenStatusEnum;
  public product: Product;
  public productTransactionQuantityHistory: Array<ProductTransactionQuantityHistory>;


  constructor() {
    super();
    this.productTransactionQuantityHistory = new Array<ProductTransactionQuantityHistory>();
  }

  get isPaid(): boolean {
    return this.status === PaymenStatusEnum.Paid;
  }

  get priceFormatted(): string {
    return NumberFormatter.formatCurrency(this.price);
  }

  get returnQuantity(): number {
    if (this.productTransactionQuantityHistory.length === 0) return 0;

    const latestQuantityHistory = this.productTransactionQuantityHistory[this.productTransactionQuantityHistory.length - 1];
    const returnQuantity = latestQuantityHistory.quantity - this.quantity;
    return returnQuantity < 0 ? 0 : returnQuantity;
  }
}

export class ProductTransactionQuantityHistory extends Entity {
  public quantity: number;
  public dateCreated: Date;

  constructor() {
    super();
  }
}
