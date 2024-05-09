import { PaymenStatusEnum } from '../_enum/payment-status.enum';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';
import { IModelNode } from '../_interfaces/imodel-node';
import { CustomerStore } from './customer-store';
import { Entity } from './entity.model';
import { Product } from './product';

export class Transaction extends Entity implements IModelNode {
  public storeId: number;
  public invoiceNo: string;
  public discount: number;
  public transactionDate: Date;
  public dueDate: Date;
  public store: CustomerStore;
  public modeOfPayment: number;
  public productTransactions: Array<ProductTransaction>;
  public hasUnpaidProductTransaction: boolean;
  public balance: number;
  public total: number;
  public badOrderAmount: number;

  get transactionDateFormatted(): string {
    return DateFormatter.format(this.transactionDate, 'MMM DD, YYYY');
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

  get netTotalFormatted(): string {
    const calculatedNetTotalAmount =
      (this.total - (this.discount / 100) * this.total) - this.badOrderAmount;
    return NumberFormatter.formatCurrency(calculatedNetTotalAmount);
  }

  get balanceFormatted(): string {
    return NumberFormatter.formatCurrency(this.balance);
  }

  constructor() {
    super();
    this.productTransactions = new Array<ProductTransaction>();
    this.store = new CustomerStore();
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
