import { StockAuditSourceEnum } from 'src/app/_enum/stock-audit-source.enum';

export interface IProductStockAuditInput {
  id: number;
  productId: number;
  quantity: number;
  warehouseId: number;
  pricePerUnit: number;
  stockAuditSource: StockAuditSourceEnum;
}
