import { StockAuditSourceEnum } from 'src/app/_enum/stock-audit-source.enum';

export interface IProductStockWarehouseAuditInput {
  id: number;
  productId: number;
  pricePerUnit: number;
  quantity: number;
  stockAuditSource: StockAuditSourceEnum;
  productWarehouseStockReceiptEntryId: number;
  productStockPerWarehouseId: number;
}
