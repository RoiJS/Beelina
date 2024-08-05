import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';
import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';

export class Payment extends Entity implements IModelNode {
  public transactionId: number;
  public amount: number;
  public notes: string;
  public paymentDate: Date;

  constructor() {
    super();
    this.paymentDate = new Date();
  }


  get paymentDateFormatted(): string {
    return DateFormatter.format(this.paymentDate, 'MMM DD, YYYY hh:mm A');
  }

  get amountFormatted(): string {
    return NumberFormatter.formatCurrency(this.amount);
  }

}
