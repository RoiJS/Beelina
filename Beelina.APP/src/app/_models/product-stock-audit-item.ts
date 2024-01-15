import { StockAuditSourceEnum } from '../_enum/stock-audit-source.enum';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';

export class ProductStockAuditItem extends Entity implements IModelNode {
  public transactionNumber: number
  public quantity: number;
  public stockAuditSource: StockAuditSourceEnum;
  public modifiedDate: Date;
  public modifiedBy: string;

  get dateCreatedFormatted(): string {
    return DateFormatter.format(this.modifiedDate, 'MMM DD, YYYY HH:mm');
  }

  constructor() {
    super();
  }
}
