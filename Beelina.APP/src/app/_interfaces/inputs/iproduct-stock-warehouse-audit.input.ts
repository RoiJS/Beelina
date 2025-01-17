import { StockAuditSourceEnum } from 'src/app/_enum/stock-audit-source.enum';

export interface IProductStockWarehouseAuditInput {
  id: number;
  productStockPerWarehouseId: number;
  quantity: number;
  stockAuditSource: StockAuditSourceEnum;
}
