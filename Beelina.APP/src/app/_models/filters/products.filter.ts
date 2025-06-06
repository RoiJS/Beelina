import { StockStatusEnum } from "src/app/_enum/stock-status.enum";

export class ProductsFilter {
  public supplierId: number = 0;
  public stockStatus: StockStatusEnum = StockStatusEnum.All;

  isActive() {
    return this.supplierId !== 0 || this.stockStatus !== StockStatusEnum.All;
  }
}
