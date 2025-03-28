import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';
import { ProductStockWarehouseAudit } from './product-stock-warehouse-audit';
import { Supplier } from './supplier';

export class ProductWarehouseStockReceiptEntry extends Entity implements IModelNode {
  public supplierId: number;
  public supplier: Supplier;
  public stockEntryDate: Date;
  public referenceNo: string;
  public plateNo: string;
  public notes: string;
  public warehouseId: number;
  public productStockWarehouseAuditInputs: Array<ProductStockWarehouseAudit>;

  constructor() {
    super();
    this.supplier = new Supplier();
    this.productStockWarehouseAuditInputs = [];
  }
}
