import { IProductStockWarehouseAuditInput } from './iproduct-stock-warehouse-audit.input';

export interface IProductWarehouseStockReceiptEntryInput {
  id: number;
  supplierId: string;
  stockEntryDate: Date;
  referenceNo: string;
  plateNo: string;
  warehouseId: number;
  productStockWarehouseAudits: Array<IProductStockWarehouseAuditInput>;
}
