import { IProductStockWarehouseAuditInput } from './iproduct-stock-warehouse-audit.input';
import { PurchaseOrderStatusEnum } from '../../_enum/purchase-order-status.enum';
import { IProductWarehouseStockReceiptDiscountInput } from './product-warehouse-stock-receipt-discount-input.interface';

export interface IProductWarehouseStockReceiptEntryInput {
  id: number;
  supplierId: number;
  stockEntryDate: Date;
  referenceNo: string;
  plateNo: string;
  warehouseId: number;
  notes: string;
  invoiceNo: string;
  invoiceDate: Date;
  dateEncoded: Date;
  purchaseOrderStatus: PurchaseOrderStatusEnum;
  location: string;
  productStockWarehouseAuditInputs: Array<IProductStockWarehouseAuditInput>;
  discounts: IProductWarehouseStockReceiptDiscountInput[];
}
