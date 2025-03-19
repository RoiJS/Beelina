import { StockAuditSourceEnum } from '../_enum/stock-audit-source.enum';
import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';

export class ProductStockWarehouseAudit extends Entity implements IModelNode {
  public productId: number;
  public pricePerUnit: number;

  public productStockPerWarehouseId: number;
  public quantity: number;
  public stockAuditSource: StockAuditSourceEnum = StockAuditSourceEnum.OrderFromSupplier;

  constructor() {
    super();
  }
}
