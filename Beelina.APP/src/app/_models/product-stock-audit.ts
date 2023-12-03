import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';

export class ProductStockAudit extends Entity implements IModelNode {
  public quantity: number
  public withdrawalSlipNo: string;
  public dateCreated: Date;

  get dateCreatedFormatted(): string {
    return DateFormatter.format(this.dateCreated, 'MMM DD, YYYY HH:mm');
  }

  constructor() {
    super();
  }
}
