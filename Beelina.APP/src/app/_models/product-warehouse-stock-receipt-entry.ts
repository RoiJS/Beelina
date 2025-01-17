import { IModelNode } from '../_interfaces/imodel-node';
import { IProductWarehouseStockReceiptEntryPayload } from '../_interfaces/payloads/iproduct-warehouse-stock-receipt-entry-query.payload';
import { Entity } from './entity.model';
import { ProductStockWarehouseAudit } from './product-stock-warehouse-audit';
import { Supplier } from './supplier';

export class ProductWarehouseStockReceiptEntry extends Entity implements IProductWarehouseStockReceiptEntryPayload, IModelNode {
  public supplierId: string;
  public supplier: Supplier;
  public stockEntryDate: Date;
  public referenceNo: string;
  public plateNo: string;
  public warehouseId: number;
  public productStockWarehouseAudits: Array<ProductStockWarehouseAudit>;
  public typename: string;

  constructor() {
    super();
    this.supplier = new Supplier();
    this.productStockWarehouseAudits = [];
  }
}
