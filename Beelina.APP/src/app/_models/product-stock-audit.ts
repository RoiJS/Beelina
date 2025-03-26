import { StockAuditSourceEnum } from '../_enum/stock-audit-source.enum';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';
import { User } from './user.model';

export class ProductStockAudit extends Entity implements IModelNode {
  public productId: number;
  public pricePerUnit: number;

  public productWithdrawalEntryId: number
  public quantity: number
  public withdrawalSlipNo: string;
  public dateCreated: Date;
  public createdBy: User;
  public warehouseId: number;
  public stockAuditSource: StockAuditSourceEnum = StockAuditSourceEnum.OrderFromSupplier;

  get dateCreatedFormatted(): string {
    return DateFormatter.format(this.dateCreated, 'MMM DD, YYYY HH:mm');
  }

  constructor() {
    super();
    this.createdBy = new User();
  }
}
