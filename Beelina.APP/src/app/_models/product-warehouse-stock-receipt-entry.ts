import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';
import { ProductStockWarehouseAudit } from './product-stock-warehouse-audit';
import { Supplier } from './supplier';
import { PurchaseOrderStatusEnum } from '../_enum/purchase-order-status.enum';

export class ProductWarehouseStockReceiptEntry extends Entity implements IModelNode {
  public supplierId: number;
  public supplier: Supplier;
  public stockEntryDate: Date;
  public referenceNo: string;
  public plateNo: string;
  public notes: string;
  public warehouseId: number;
  public discount: number;
  public invoiceNo: string;
  public invoiceDate: Date;
  public dateEncoded: Date;
  public purchaseOrderStatus: PurchaseOrderStatusEnum;
  public location: string;
  public productStockWarehouseAuditInputs: Array<ProductStockWarehouseAudit>;

  constructor() {
    super();
    this.supplier = new Supplier();
    this.productStockWarehouseAuditInputs = [];
    this.discount = 0;
    this.invoiceNo = '';
    this.location = '';
    this.purchaseOrderStatus = PurchaseOrderStatusEnum.OPEN;
  }
}
