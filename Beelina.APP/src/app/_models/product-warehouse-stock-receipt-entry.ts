import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';
import { ProductStockWarehouseAudit } from './product-stock-warehouse-audit';
import { Supplier } from './supplier';

export class ProductWarehouseStockReceiptEntry extends Entity implements IModelNode {
  public supplierId: string;
  public supplier: Supplier;
  public stockEntryDate: Date;
  public referenceNo: string;
  public plateNo: string;
  public warehouseId: number;
  public productStockWarehouseAudits: Array<ProductStockWarehouseAudit>;

  constructor() {
    super();
    this.supplier = new Supplier();
    this.productStockWarehouseAudits = [];
  }
}
