import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';
import { ProductStockWarehouseAudit } from './product-stock-warehouse-audit';
import { ProductWarehouseStockReceiptDiscount } from './product-warehouse-stock-receipt-discount.model';
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
  public discounts: Array<ProductWarehouseStockReceiptDiscount>;
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
    this.discounts = [];
    this.invoiceNo = '';
    this.location = '';
    this.purchaseOrderStatus = PurchaseOrderStatusEnum.OPEN;
  }
}
